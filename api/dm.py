from flask import Blueprint, request, jsonify, session
from create_db import get_db_connection
import sqlite3
from datetime import datetime

dm = Blueprint('dm', __name__)

@dm.route('/api/saveDM', methods=['POST'])
def saveDM():
    if 'email' not in session:
        return jsonify({'error': '인증되지 않은 사용자'}), 401
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request data'}), 400

        sender_username = data.get('sender')
        receiver_username = data.get('receiver')
        message = data.get('message')

        if not sender_username or not receiver_username or not message:
            return jsonify({'error': '필수 데이터가 누락되었습니다.'}), 400

        sender_id = get_userid_by_username(sender_username)
        receiver_id = get_userid_by_username(receiver_username)    

        if sender_id is None or receiver_id is None:
            return jsonify({'error': '유효하지 않은 수신자나 송신자입니다'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO messages (sender_id, receiver_id, message, timestamp, status) VALUES (?, ?, ?, ?, ?)',
            (sender_id, receiver_id, message, datetime.now(), 'unread')
        )
        conn.commit()
        conn.close()

        return jsonify({'message': '메세지가 전송되었습니다.'}), 201

    except Exception as e:
        # Log the error e for debugging
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@dm.route('/api/getreceivedDM', methods=['GET'])
def getreceivedDM():
    if 'email' not in session:
        return jsonify({'error': '인증되지 않은 사용자'}), 401
    
    current_user_id = session['user_id']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM messages WHERE receiver_id = ? ORDER BY timestamp DESC', (current_user_id,))
    results = cursor.fetchall()

    Received_DM_info = []
    for row in results:
        sender_id = row[1]
        
        # sender_name을 가져오는 쿼리
        cursor.execute('SELECT nickname FROM users WHERE id = ?', (sender_id,))
        sender_name_result = cursor.fetchone()
        sender_name = sender_name_result[0] if sender_name_result else 'Unknown'
        
        message = {
            'message_id': row[0],
            'sender_id': row[1],
            'receiver_id': row[2],
            'message': row[3],
            'timestamp': row[4],
            'status': row[5],
            'sender_name': sender_name
        }
        Received_DM_info.append(message)

    conn.close()

    return jsonify(Received_DM_info)

def get_userid_by_username(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM users WHERE nickname = ?', (username,))
    user_id = cursor.fetchone()
    conn.close()    
    if user_id is not None:
        return user_id[0]
    else:
        return None
    
from flask import Blueprint, request, jsonify, session
from create_db import get_db_connection
import sqlite3
from datetime import datetime

auth = Blueprint('auth', __name__)

# 회원가입 창에서 회원가입을 진행할 때
@auth.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    nickname = data.get('nickname')
    
    if not email or not password or not nickname:
        return jsonify({'error': '모든 필드를 입력해주세요!'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)', (email, password, nickname))
        conn.commit()
        return jsonify({'message': '회원가입이 완료되었습니다'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': '이미 존재하는 이메일 또는 닉네임입니다'}), 400
    finally:
        conn.close()

# 로그인 창에서 로그인을 진행할 때
@auth.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': '이메일과 비밀번호를 입력해주세요!'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT password, nickname FROM users WHERE email = ?', (email,))
    result = cursor.fetchone()
    
    if result is None:
        conn.close()
        return jsonify({'error': '잘못된 이메일입니다'}), 400
    
    stored_password, stored_nickname = result
    
    conn.close()
    if stored_password != password:
        return jsonify({'error': '잘못된 비밀번호입니다'}), 400
    
    session['email'] = email
    session['nickname'] = stored_nickname
    
    resp = jsonify({'message': '로그인 성공'}), 200
    return resp

@auth.route('/api/logout', methods=['POST'])
def logout():
    session.clear()     #세션 제거
    resp = jsonify({'message': '로그아웃 성공'}), 200
    return resp

@auth.route('/api/userinfo', methods=['GET'])
def userinfo():
    if 'email' in session and 'nickname' in session:
        email = session['email']
        nickname = session['nickname']
        return jsonify({'email':email, 'nickname':nickname}), 200
    else:
        return jsonify({'error': '인증되지 않은 사용자'}), 401

@auth.route('/api/getusernickname', methods=['GET'])
def get_user_nickname():
    if 'email' not in session:
        return jsonify({'error': '인증되지 않은 사용자'}), 401
    
    conn = get_db_connection()
    cursor = conn.cursor()

    # 현재 접속한 사용자의 이메일로 ID 조회
    current_user_email = session['email']
    cursor.execute('SELECT id FROM users WHERE email = ?', (current_user_email,))
    current_user_id = cursor.fetchone()
    
    if current_user_id is None:
        conn.close()
        return jsonify({'error': '사용자를 찾을 수 없음'}), 404

    current_user_id = current_user_id[0]

    # 현재 접속한 사용자를 제외하고 사용자 목록 조회
    cursor.execute('SELECT id, nickname FROM users WHERE id != ? ORDER BY id ASC', (current_user_id,))
    results = cursor.fetchall()
    conn.close()
    
    users_list = [{'id': user[0], 'nickname': user[1]} for user in results]
    return jsonify(users_list)

@auth.route('/api/saveDM', methods=['POST'])
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
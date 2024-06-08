from flask import Blueprint, request, jsonify, session
from create_db import get_db_connection
from datetime import datetime

import base64

upload = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(photoname):
    return '.' in photoname and photoname.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload.route('/api/upload', methods=['POST'])
def upload_photo():
    if 'user_id' not in session:
        print(f'Session: {session}')    #세션 정보
        return jsonify({'error': 'User  not logged in'}), 403
    
    if 'photo' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    photo = request.files['photo']
    description = request.form.get('description', '')
    keywords = request.form.get('keywords', '')
    
    if photo.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if photo and allowed_file(photo.filename):
        photoname = photo.filename
        photo_data = photo.read()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            upload_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute('INSERT INTO photos (user_id, photoname, photo_data, description, upload_date) VALUES (?, ?, ?, ?, ?)', 
                           (session['user_id'], photoname, photo_data, description, upload_date))
            
            #삽입된 사진의 ID 가져옴
            photo_id = cursor.lastrowid         
            
            #키워드를 쉽표로 분리하여 리스트로 변환
            keyword_list = keywords.split(',')
            for keyword in keyword_list:
                cursor.execute('INSERT INTO keywords (photo_id, keyword) VALUES (?, ?)', (photo_id, keyword.strip()))
            
            conn.commit()
            return jsonify({'message': '업로드 성공'}), 201
        except Exception as e:
            conn.rollback()
            print(f'사진 업로드 실패: {str(e)}')
            return jsonify({'error': f'사진 업로드 실패: {str(e)}'}), 500
        finally:
            conn.close()
    
    return jsonify({'error': '허용되지 않은 파일 형식입니다'}), 400

@upload.route('/api/getuploadphotos', methods=['GET'])
def get_upload_photos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT photos.id, users.nickname, photos.photo_data, GROUP_CONCAT(keywords.keyword) AS hashtags, photos.description
            FROM photos
            JOIN users ON photos.user_id = users.id
            LEFT JOIN keywords ON photos.id = keywords.photo_id
            GROUP BY photos.id
            ORDER BY photos.upload_date DESC
        """)
        
        photos = cursor.fetchall()
        
        photo_list = [
            {
                'id': row[0],
                'nickname': row[1],
                'photo_data': base64.b64encode(row[2]).decode('utf-8'),     #이미지를 base64로 인코딩하여 문자열 변환
                'hashtags': row[3].split(',') if row[3] else [],
                'description': row[4]
            } for row in photos
        ]
        return jsonify(photo_list), 200
        
    except Exception as e:
        print('오류 발생:', str(e))
        return jsonify({'error': str(e)}), 500

@upload.route('/api/photo/<int:photo_id>', methods=['GET', 'PUT', 'DELETE'])
def update_photo(photo_id):
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 403
    
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT description, photo_data
                FROM photos
                WHERE id = ? AND user_id = ?
            """, (photo_id, session['user_id']))

            photo_data = cursor.fetchone()

            if photo_data:
                # 키워드 가져오기
                cursor.execute("""
                    SELECT keyword
                    FROM keywords
                    WHERE photo_id = ?
                """, (photo_id,))
                keywords = [row[0] for row in cursor.fetchall()]
                
                response_data = {
                    'description': photo_data[0],
                    'photo_data': base64.b64encode(photo_data[1]).decode('utf-8'),  # 이미지 데이터를 base64로 인코딩하여 클라이언트에게 반환
                    'keywords': keywords
                }
                # print('서버 응답 데이터:', response_data)
                return jsonify(response_data), 200
            else:
                return jsonify({'error': 'Photo not found or unauthorized access'}), 404

        except Exception as e:
            print('오류 발생:', str(e))
            return jsonify({'error': str(e)}), 500

        finally:
            conn.close()
    
        
    if request.method == 'PUT':
        data = request.json
        description = data.get('description', '')
        keywords = data.get('keywords', [])     #keywords는 리스트로 처리

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # description과 upload_date를 업데이트
            cursor.execute("""
                UPDATE photos
                SET description = ?, upload_date = datetime('now')
                WHERE id = ? AND user_id = ?
            """, (description, photo_id, session['user_id']))

            # 키워드 업데이트를 위해 기존 키워드 삭제 후 새로운 키워드 삽입
            cursor.execute('DELETE FROM keywords WHERE photo_id = ?', (photo_id,))
            for keyword in keywords:
                cursor.execute('INSERT INTO keywords (photo_id, keyword) VALUES (?, ?)', (photo_id, keyword.strip()))

            conn.commit()
            return jsonify({'message': 'Photo updated successfully'}), 200

        except Exception as e:
            conn.rollback()
            print('오류 발생:', str(e))
            return jsonify({'error': str(e)}), 500

        finally:
            conn.close()
    
    
    if request.method == 'DELETE':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
             # 키워드 삭제
            cursor.execute('DELETE FROM keywords WHERE photo_id = ?', (photo_id,))

            # 사진 삭제
            cursor.execute('DELETE FROM photos WHERE id = ? AND user_id = ?', (photo_id, session['user_id']))

            conn.commit()
            return jsonify({'message': 'Photo deleted successfully'}), 200

        except Exception as e:
            conn.rollback()
            print('오류 발생:', str(e))
            return jsonify({'error': str(e)}), 500

        finally:
            conn.close()

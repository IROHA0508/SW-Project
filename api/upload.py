from flask import Blueprint, request, jsonify, session
from create_db import get_db_connection
from datetime import datetime

import base64

upload = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(photoname):
    return '.' in photoname and photoname.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload.route('/api/upload', methods=['POST'])
def upload_photos():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 403
    
    if 'photos' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    photos = request.files.getlist('photos')  # 여러 장의 사진을 받기 위해 getlist() 함수를 사용합니다.
    description = request.form.get('description', '')
    keywords = request.form.get('keywords', '')
    
    success_count = 0
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        upload_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # 게시물(post)을 먼저 생성
        cursor.execute('INSERT INTO post (user_id, description, upload_date) VALUES (?, ?, ?)',
                       (session['user_id'], description, upload_date))
        
        # 삽입된 게시물의 ID 가져옴
        post_id = cursor.lastrowid

        # 각 사진을 해당 게시물에 연결하여 저장
        for photo in photos:
            if photo and allowed_file(photo.filename):
                photoname = photo.filename
                photo_data = photo.read()
                
                # 사진을 해당 게시물에 연결하여 저장
                cursor.execute('INSERT INTO photos (post_id, photo_data, photoname) VALUES (?, ?, ?)',
                               (post_id, photo_data, photoname))
                success_count += 1
            else:
                print(f'허용되지 않은 파일 형식: {photo.filename}')
        
        # 키워드를 쉼표로 분리하여 리스트로 변환
        keyword_list = keywords.split(',')
        for keyword in keyword_list:
            cursor.execute('INSERT INTO keywords (post_id, keyword) VALUES (?, ?)', (post_id, keyword.strip()))
        
        conn.commit()
        
        if success_count > 0:
            return jsonify({'message': f'{success_count}개의 사진 업로드 성공'}), 201
        else:
            return jsonify({'error': '업로드된 사진이 없습니다'}), 400
    except Exception as e:
        conn.rollback()
        print(f'사진 업로드 실패: {str(e)}')
        return jsonify({'error': f'사진 업로드 실패: {str(e)}'}), 500
    finally:
        conn.close()


@upload.route('/api/getuploadphotos', methods=['GET'])
def get_upload_photos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT post.id, users.nickname, photos.photo_data, GROUP_CONCAT(keywords.keyword) AS hashtags, post.description
            FROM photos
            JOIN post ON photos.post_id = post.id
            JOIN users ON post.user_id = users.id
            LEFT JOIN keywords ON photos.id = keywords.photo_id
            GROUP BY post.id
            ORDER BY post.upload_date DESC
        """)
        
        photo_information = cursor.fetchall()
        
        photo_list = [
            {
                'id': row[0],
                'nickname': row[1],
                'photo_data': base64.b64encode(row[2]).decode('utf-8'),     # 이미지를 base64로 인코딩하여 문자열 변환
                'hashtags': row[3].split(',') if row[3] else [],
                'description': row[4]
            } for row in photo_information
        ]
        return jsonify(photo_list), 200
        
    except Exception as e:
        print('오류 발생:', str(e))
        return jsonify({'error': str(e)}), 500


@upload.route('/api/post/<int:photo_id>', methods=['GET', 'PUT', 'DELETE'])
def update_photo(photo_id):
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 403
    
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT photos.id, post.user_id, photos.photo_data, GROUP_CONCAT(keywords.keyword) AS hashtags, post.description
                FROM photos
                JOIN post ON photos.post_id = post.id
                LEFT JOIN keywords ON photos.id = keywords.photo_id
                WHERE photos.id = ? AND post.user_id = ?
                GROUP BY photos.id
            """, (photo_id, session['user_id']))

            photo_information = cursor.fetchone()

            if photo_information:
                response_data = {
                    'id': photo_information[0],
                    'user_id': photo_information[1],
                    'photo_data': base64.b64encode(photo_information[2]).decode('utf-8'),  # 이미지 데이터를 base64로 인코딩하여 클라이언트에게 반환
                    'hashtags': photo_information[3].split(',') if photo_information[3] else [],
                    'description': photo_information[4]
                }
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
                UPDATE post
                SET description = ?, upload_date = datetime('now')
                WHERE id = (SELECT post_id FROM photos WHERE id = ?) AND user_id = ?
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

            # 게시물과 관련된 키워드 삭제
            cursor.execute('DELETE FROM keywords WHERE post_id = ?', (photo_id,))

            # 게시물과 관련된 사진 삭제
            cursor.execute('DELETE FROM photos WHERE post_id = ?', (photo_id,))

            # 게시물 삭제
            cursor.execute('DELETE FROM post WHERE id = ?', (photo_id,))

            conn.commit()
            return jsonify({'message': 'Post and associated photos and keywords deleted successfully'}), 200

        except Exception as e:
            conn.rollback()
            print('오류 발생:', str(e))
            return jsonify({'error': str(e)}), 500

        finally:
            conn.close()

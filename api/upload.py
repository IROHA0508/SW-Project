from flask import Blueprint, request, jsonify, session
from create_db import get_db_connection
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from flask import current_app

import base64

upload = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(photoname):
    return '.' in photoname and photoname.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

UPLOAD_FOLDER = 'image'

def save_uploaded_photos(photos):
    photo_paths = []
    for photo in photos:
        if photo and allowed_file(photo.filename):
            filename = secure_filename(photo.filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            photo.save(filepath)
            photo_paths.append(filepath)
        else:
            print(f'허용되지 않은 파일 형식: {photo.filename}')
    return photo_paths

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
        photo_paths = save_uploaded_photos(photos)
        for photo_path in photo_paths:
            photoname = os.path.basename(photo_path)
            # 사진의 경로를 데이터베이스에 저장
             # 사진의 상대적인 URL을 생성
            photo_url = os.path.join('image', photoname).replace('\\', '/')
            cursor.execute('INSERT INTO photos (post_id, photo_url, photoname) VALUES (?, ?, ?)',
                           (post_id, photo_url, photoname))
            success_count += 1
            
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
            SELECT 
                post.id, 
                users.nickname, 
                post.description,
                GROUP_CONCAT(DISTINCT photos.photo_url) AS photo_urls, 
                GROUP_CONCAT(DISTINCT keywords.keyword) AS hashtags
            FROM post
            JOIN users ON post.user_id = users.id
            LEFT JOIN photos ON photos.post_id = post.id
            LEFT JOIN keywords ON post.id = keywords.post_id
            GROUP BY post.id
            ORDER BY post.upload_date DESC
        """)
        
        photo_information = cursor.fetchall()
        
        photo_list = [
            {
                'id': row[0],
                'nickname': row[1],
                'description': row[2],
                'photo_urls': list(set(row[3].split(','))) if row[3] else [],
                'hashtags': list(set(row[4].split(','))) if row[4] else [],
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
                SELECT post.id, users.id, post.description, GROUP_CONCAT(photos.photo_url) AS photo_urls, GROUP_CONCAT(keywords.keyword) AS hashtags
                FROM post
                JOIN users ON post.user_id = users.id
                LEFT JOIN photos ON photos.post_id = post.id
                LEFT JOIN keywords ON keywords.post_id = post.id
                WHERE post.id = ? AND post.user_id = ?
                GROUP BY post.id
            """, (photo_id, session['user_id']))


            photo_information = cursor.fetchone()

            if photo_information:
                response_data = {
                    'id': photo_information[0],
                    'user_id': photo_information[1],
                    'description': photo_information[2],
                    'photo_urls': list(set(photo_information[3].split(','))) if photo_information[3] else [],
                    'keywords': list(set(photo_information[4].split(','))) if photo_information[4] else [],
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

            cursor.execute("""
                UPDATE post
                SET description = ?
                WHERE id = ? AND user_id = ?
            """, (description, photo_id, session['user_id']))

            cursor.execute('DELETE FROM keywords WHERE post_id = ?', (photo_id,))
            for keyword in keywords:
                cursor.execute('INSERT INTO keywords (post_id, keyword) VALUES (?, ?)', (photo_id, keyword.strip()))

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
            cursor.execute('DELETE FROM post WHERE id = ? AND user_id = ?', (photo_id, session['user_id']))

            conn.commit()
            return jsonify({'message': 'Post and associated photos and keywords deleted successfully'}), 200

        except Exception as e:
            conn.rollback()
            print('오류 발생:', str(e))
            return jsonify({'error': str(e)}), 500

        finally:
            conn.close()


@upload.route('/api/searchphotos', methods=['GET'])
def search_photos():
    keyword = request.args.get('keyword', '')

    if not keyword:
        return jsonify({'error': '검색 키워드가 제공되지 않았습니다.'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT 
                post.id, 
                users.nickname, 
                post.description,
                GROUP_CONCAT(DISTINCT photos.photo_url) AS photo_urls, 
                GROUP_CONCAT(DISTINCT keywords.keyword) AS hashtags
            FROM post
            JOIN users ON post.user_id = users.id
            LEFT JOIN photos ON photos.post_id = post.id
            LEFT JOIN keywords ON post.id = keywords.post_id
            WHERE keywords.keyword LIKE ?
            GROUP BY post.id
            ORDER BY post.upload_date DESC
        """
        search_term = f'%{keyword}%'
        cursor.execute(query, (search_term,))

        photo_information = cursor.fetchall()

        photo_list = [
            {
                'id': row[0],
                'nickname': row[1],
                'description': row[2],
                'photo_urls': list(set(row[3].split(','))) if row[3] else [],
                'hashtags': list(set(row[4].split(','))) if row[4] else [],
            } for row in photo_information
        ]

        return jsonify(photo_list), 200

    except Exception as e:
        print('오류 발생:', str(e))
        return jsonify({'error': str(e)}), 500

    finally:
        conn.close()

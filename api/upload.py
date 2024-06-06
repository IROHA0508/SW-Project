from flask import Blueprint, request, jsonify, session
from create_db import get_db_connection
import os
from datetime import datetime

upload = Blueprint('upload', __name__)

UPLOAD_FOLDER = 'uploads_photo'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1).lower() in ALLOWED_EXTENSIONS

@upload.route('/api/upload', methods=['POST'])
def upload_photo():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    description = request.form.get('description', '')
    keywords = request.form.get('keywords', '')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = file.filename
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            upload_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute('INSERT INTO photos (user_id, photo_url, description, upload_date) VALUES (?, ?, ?, ?)', 
                           (session['user_id'], filename, description, upload_date))
            
            #삽입된 사진의 ID 가져옴
            photo_id = cursor.lastrowid         
            
            #키워드를 쉽표로 분리하여 리스트로 변환
            keyword_list = keywords.split(',')
            for keyword in keyword_list:
                cursor.execute('INSERT INTO keywords (photo_id, keyword) VALUES (?, ?)', (photo_id, keyword.strip()))
            
            conn.commit()
            return jsonify({'message': '업로드 성공'}), 201
        except Exception as e:
            return jsonify({'error': f'사진 업로드 실패: {str(e)}'}), 500
        finally:
            conn.close()
    
    return jsonify({'error': '허용되지 않은 파일 형식입니다'}), 400
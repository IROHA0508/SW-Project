from flask import Flask, request, jsonify, make_response
import sqlite3

app = Flask(__name__)

# 이제 안 쓰는 파일
# 회원가입 창에서 회원가입을 진행할 때
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    nickname = data.get('nickname')
    
    if not email or not password or not nickname:
        return jsonify({'error': '모든 필드를 입력해주세요!'}), 400
    
    conn = sqlite3.connect('user.db')
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
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': '이메일과 비밀번호를 입력해주세요!'}), 400
    
    conn = sqlite3.connect('user.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT password FROM users WHERE email = ?', (email,))
    result = cursor.fetchone()
    
    if result is None:
        conn.close()
        return jsonify({'error': '잘못된 이메일입니다'}), 400
    
    stored_password = result[0]
    conn.close()
    if stored_password != password:
        return jsonify({'error': '잘못된 비밀번호입니다'}), 400
    
    resp = make_response(jsonify({'message': '로그인 성공'}), 200)
    resp.set_cookie('auth_token', 'your_auth_token', httponly=True, secure=False)
    return resp

@app.route('/api/logout', methods=['POST'])
def logout():
    resp = make_response(jsonify({'message': '로그아웃 성공'}), 200)
    resp.set_cookie('auth_token', '', expires=0, httponly=True, secure=False)
    return resp


if __name__ == "__main__":
    app.run(port=5000, debug=True)
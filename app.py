# from flask import Flask, request, render_template, redirect, url_for, flash
# from flask_mysqldb import MySQL         #데베 연결을 위해 flask 확장

# app = Flask(__name__)
# app.secret_key = 'your secret key'

# app.config['MYSQL_HOST'] = 'localhost'      #mysql host
# app.config['MYSQL_USER'] = 'root'           #mysql 사용자 이름
# app.config['MYSQL_PW'] = 'database12@'      #mysql 비밀번호
# app.config['MYSQL_DB'] = 'userdatabase'     #mysql 사용할 데이터베이스

# mysql = MySQL(app)

# @app.route('/register', method=['GET', 'POST'])
# def register():
#     msg = ''
#     if request.method == 'POST' and 'email' in request.form and 'pw' in request.form and 'nickname' in request.form:
#         email = request.form['email']           #폼 데이터에서 이메일 가져오기
#         pw = request.form['pw']                 #폼 데이터에서 비밀번호 가져오기
#         nickname = request.form['nickname']     #폼 데이터에서 닉네임 가져오기
        
#         cursor = mysql.connection.cursor()                                      #mysql 커서 생성
#         cursor.execute('SELECT * FROM users WHERE email = %s', (email,))        #이메일 사용해 사용자 조회
#         account = cursor.fetchone()                                             #결과 가져오기 없다면 none
        
#         if account:
#             msg = '계정이 이미 존재합니다!'
#         elif not email or not pw or not nickname:
#             msg = '누락된 부분이 있습니다!'
#         else:
#             cursor.execute('INSERT INTO users (email, pw, nickname) VALUES (%s, %s, %s)', (email, pw, nickname))
#             #새로운 사용자 정보를 users 테이블에 저장
#             mysql.connection.commit()
#             msg = '회원가입이 완료됐습니다!'
    
#     return render_template('Main_v1.html', msg=msg)

# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('Main_v1.html')

if __name__ == '__main__':
    app.run(debug=True)
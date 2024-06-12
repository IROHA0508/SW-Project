import sqlite3

# SQLite 데이터베이스에 연결
conn = sqlite3.connect('user.db')
cursor = conn.cursor()

# 사용자(users) 테이블에서 모든 데이터 조회
print("Users:")
cursor.execute('SELECT * FROM users')
users = cursor.fetchall()
for user in users:
    print(user)

# 사진(photos) 테이블에서 모든 데이터 조회
print("\nPhotos:")
cursor.execute('SELECT * FROM photos')
photos = cursor.fetchall()
for photo in photos:
    print(photo)

# 키워드(keywords) 테이블에서 모든 데이터 조회
print("\nKeywords:")
cursor.execute('SELECT * FROM keywords')
keywords = cursor.fetchall()
for keyword in keywords:
    print(keyword)

# 연결 종료
conn.close()
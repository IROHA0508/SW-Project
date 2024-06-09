from create_db import get_db_connection
import sqlite3

# 테이블 삭제 명령어
def drop_table():
    conn = get_db_connection()
    
    tables = ['users', 'photos', 'keywords', 'messages']
    for table in tables:
        conn.execute(f'DROP TABLE IF EXISTS {table}')
        print(f'{table}테이플 삭제 완료')
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    drop_table()
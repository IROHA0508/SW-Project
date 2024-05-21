CREATE database userdatabase;		#데이터베이스 생성
USE userdatabase;					#데이터베이스 생성한 거 사용

CREATE TABLE users(					#테이블 생성
	id int auto_increment primary key,
    email varchar(255) not null unique,
    pw varchar(255) not null,
    nickname varchar(255) not null
);

SHOW tables;			#테이블 확인		
describe users;			#테이블 필드 확인
select * from users;		#테이블 행 확인
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 회원가입 요청을 보내는 부분
    try {
      const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, nickname }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('회원가입에 성공했습니다!'); // 회원가입 성공 메시지 설정
      setError(''); // 에러 메시지 초기화
      navigate('/');  // '/'경로로 이동
      alert('회원가입에 성공했습니다!');

    } else {
      setMessage(''); // 메시지 초기화
      setError(data.error); // 에러 메시지 설정
      }
    } catch (error){
      console.error('회원가입 오류', error);
      setMessage(''); // 메시지 초기화
      setError('회원가입 중 오류가 발생했습니다'); // 에러 메시지 설정
    }
  };


  return (
    <div className="container">
      <div className='form-container'>
        <div>
          <h1>회원가입</h1>
          <form onSubmit={handleSubmit}>
            <p>이메일</p>
            <div className="input-container">
              <input
                type="email"
                placeholder='이메일 입력'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p>비밀번호</p>
            <div className="input-container">
              <input
                type="password"
                placeholder='비밀번호 입력(8~20자)'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <p>비밀번호 확인</p>
            <div className="input-container">
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <p>닉네임</p>
            <div className="input-container">
              <input
                type="text"
                placeholder='닉네임을 입력해주세요'
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>

            <button className = "signup-button" type="submit">회원가입</button>

          </form>
          {message && <p>{message}</p>}
          {error && <p>{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default SignUp;
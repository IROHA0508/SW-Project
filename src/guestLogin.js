import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserComponent from './usercomponent';

import './guestLogin.css'

import mainPic1 from './main_pic1.png';
import mainPic2 from './main_pic2.png';
import mainPic3 from './main_pic3.jpeg';

import profile from './profile_default.jpg';

function GuestLogin() {
    const [userList_name, setUserList_name] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllUserNickname();
    }, []);

    const fetchAllUserNickname = async () => {
        try {
          const response = await fetch('/api/getusernicknameguest', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (response.ok) {
            const data = await response.json();
            setUserList_name(data);
          } else {
            console.error('사용자 정보를 가져오는 데 실패');
          }
        } catch (error) {
          console.error('사용자 정보를 가져오는 중 오류 발생', error);
        }
    };

    const handleLogout = () => {
        navigate('/'); // 로그아웃 시 홈 페이지로 이동
    };

    return (
        <div>
            <div className='guest-main-header-container'>
                <p className='guest-main-header-text'>
                    Share Your Experience, Photo and Patience
                </p>

                <div className='guest-main-button-container'>
                    <p>게스트</p>
                    <button className="guest-main-header-button" onClick={handleLogout}>Log Out</button>
                </div>
            </div>

            <div id = "GuestPicture">
                <img src={mainPic1} className="guest-main-pic guest-main-pic1" alt="Guest Main Pic 1" />
                <img src={mainPic2} className="guest-main-pic guest-main-pic2" alt="Guest Main Pic 2" />
                <img src={mainPic3} className="guest-main-pic guest-main-pic3" alt="Guest Main Pic 3" />
            </div>

            <div className='guest-userList'>
                {userList_name.map((user, index) => (
                    <UserComponent key={user.id} profileImage={profile} username={user.nickname} />
                ))}
        </div>
        </div>
    );
}

export default GuestLogin;
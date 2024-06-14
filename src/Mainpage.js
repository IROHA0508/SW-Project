import React, { useState, useEffect } from 'react';
import { Link, useActionData, useNavigate } from 'react-router-dom';
import Slider from 'react-slick'; // 사진 슬라이더
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import './Mainpage.css';
import './DMmodal.css';

import UserComponent from './usercomponent'; // userComponent 파일 import
import UploadModal from './photoUpload';    // 업로드 모달 파일 import
import UserPhotoComponent from './UserPhotoComponent';  //userPhotoComponent 파일 import
import DMboxModal from './DMboxModal';  // DMboxModal 파일 import

// 이미지 import
import searchicon from './search_icon.png';
import profile from './profile_default.jpg';
import photo_example1 from './아이유 수능 응원 메세지.jpeg'
import photo_example2 from './아이유 인천공항.jpg'
import photo_example3 from './아이유 드림 네이버 포스트.jpeg'


function Main() {
  // 서버에서 사용자 정보(닉네임) 가져오기
  const [nickname, setNickname] = useState('');
  //모달 창 관리 - 사진 업로드 창
  const [modalOpen, setModalOpen] = useState(false);
  //모달 창 관리
  const [modalDMboxIsOpen, setDMboxModalIsOpen] = useState(false);
  // 서버에서 사용자 닉네임 받아오기 -> userList 채울 때 사용
  const [userList_name, setUserList_name] = useState([]);
  //업로드 사진 목록
  const [uploadPhotos, setUploadPhotos] = useState([]);
  // 키워드 검색
  const [searchKeyword, setSearchKeyword] = useState('');
  // 검색 결과
  const [searchResults, setSearchResults] = useState([]);
  // 로딩 상태 

  useEffect(()=>{
    fetchUserInfo();
    fetchAllUserNickname();
    fetchUploadPhotos();
  }, []);
 
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/userinfo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) { 
        const data = await response.json();
        setNickname(data.nickname);
      } else {
        console.error('사용자 정보를 가져오는 데 실패');
      }
    } catch (error) {
      console.error('사용자 정보를 가져오는 중 오류 발생', error);
    }
  }
  
  // 서버에서 모든 사람의 닉네임 받아오기
  const fetchAllUserNickname = async () => {
    try {
      const response = await fetch('/api/getusernickname', {
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
  }

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 로그아웃 성공 후 '/' 페이지로 이동
        window.location.href = '/';
      } else {
        console.error('로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생', error);
    }
  }

  // 업로드 사진 목록 가져오기
const fetchUploadPhotos = async () => {
  try {
  const response = await fetch('/api/getuploadphotos', {
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    },
  });
  
  if (response.ok) {
    const data = await response.json();
    setUploadPhotos(data);
    } else {
      console.error('사진 목록 가져오는데 실패했습니다');
    }
  } catch (error) {
    console.error('사진 목록 가져오는 중 오류 발생', error);
  }
  };

  const searchPhotos = async () => {
    try {
      const response = await fetch(`/api/searchphotos?keyword=${searchKeyword}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);  
        setSearchResults(data);
      } else {
        console.error('검색 결과를 가져오는 데 실패했습니다');
      }
    } catch (error) {
      console.error('검색 결과를 가져오는 중 오류 발생', error);
    }
  };

  //모달 열기
  const openModal = () => {
    setModalOpen(true);
  };

  //모달 닫기
  const closeModal = () => {
    setModalOpen(false);
  };

  const handleDMboxclick = () => {
    setDMboxModalIsOpen(true);
  }

  const closeDMboxModal = () => {
    setDMboxModalIsOpen(false);
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  // 검색결과가 있을 경우 사용하고, 없을 시 기존의 uploadPhotos 사용
  const displayedPhotos = searchKeyword ? searchResults : uploadPhotos;

  return (
    <div>
      <div className='main-header-container'>
        <p className='main-header-text'>
          Share Your Experience, Photo and Patience
        </p>

        <div className='main-button-container'>
          <p>{nickname} 님</p>
          <button className='main-header-button' onClick={handleDMboxclick}> DM </button>
          <button className='main-header-button' onClick={openModal}> Upload </button>
          <button className='main-header-button' onClick={handleLogout}> Log Out </button>        
        </div>

      </div>

      <DMboxModal isOpen = {modalDMboxIsOpen} closeModal={closeDMboxModal} current_username={nickname}/>
      {modalOpen && <UploadModal closeModal={closeModal} />}

      <div className='main-div' id='maindiv'>
        <div className='content-container'>
          
          <div className='searchbar-container' id='searchbar'>
            <img src={searchicon} className="search-icon" alt="search icon"/>
            <input 
              type="text" 
              className="search-input" 
              placeholder="여기는 검색하는 곳입니다" 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button className="search-button" onClick={searchPhotos}>검색</button>
          </div>

          <div className='main-user-content'>
            <div className='main-userPhoto'>
              {displayedPhotos.map(photo => {
                console.log(photo.photo_urls);
                return(
                  <UserPhotoComponent
                    key={photo.id}
                    postId={photo.id}
                    current_user={nickname}
                    profileImage={profile}
                    posted_username={photo.nickname}
                    photos={photo.photo_urls}
                    hashtags={photo.hashtags}
                    description={photo.description}
                  />
                );    
              })}

              {/* <UserPhotoComponent 
                current_user={nickname}
                profileImage={profile}
                posted_username="유애나"
                photos={example_photos}
                hashtags={['아이유']}
                description="아이유 인천공항 (사진에 대한 설명이 들어갑니다)"
              /> */}
            </div>
            
            <div className='userList'>
              {userList_name.map((user, index) => {
                return <UserComponent key={user.id} profileImage={profile} username={user.nickname} />;
              })}
            </div>

          </div>
        
        </div>
      </div>

    </div>
  );
}

export default Main;
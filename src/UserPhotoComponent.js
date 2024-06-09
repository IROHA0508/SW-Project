import React, {useState} from "react";
import Slider from 'react-slick'; // 사진 슬라이더
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import './UserPhotoComponent.css';

import DM_button from './DM_button.png';
import DMModal from './DMmodal';
import PhotoEdit from './photoEdit';

import option_button from './option_button.png';
{/* <UserPhotoComponent 
                current_user={nickname}
                profileImage={profile}
                posted_username="유애나"
                photos={photo_example2}
                hashtags={['아이유']}
                description="아이유 인천공항 (사진에 대한 설명이 들어갑니다)"
              />
               */}

function UserPhotoComponent({ photoId, current_user, profileImage, posted_username, photos, hashtags, description }) {
  const settings = {
    dots: true,
    // infinite: true,
    // speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  const [DMmodalIsOpen, setDMModalIsOpen] = useState(false);            //DM 모달
  const [PhotomodalIsOpen, setPhotoModalIsOpen] = useState(false);      //Photo 모달
  const [optionVisible, setOptionVisible] = useState(false);

  const handleDMClick = () => {
    setDMModalIsOpen(true);
  };

  const closeDMModal = () => {
    setDMModalIsOpen(false);
  };


  const handleOptionToggle = () => {
    // 옵션 표시 여부를 토글
    setOptionVisible(!optionVisible);
  };

  const handleEditClick = () => {
    setPhotoModalIsOpen(true);
  };

  const closePhotoModal = () => {
    setPhotoModalIsOpen(false);
  };

  const handleDeleteClick = async () => {
    if (window.confirm('이 게시물을 삭제하시겠습니까?')){
      try {
        const response = await fetch(`/api/photo/${photoId}`, {
          method: 'DELETE',
          credentials: 'include'
        })

        if (response.ok) {
          alert('게시물이 삭제되었습니다');
          window.location.reload();
        } else {
          console.error('게시물 삭제 실패')
        }
      } catch (error) {
        console.error('게시물 삭제 중 오류 발생', error)
      }
    }
    
  };


  return(
    <div className='user-content'>
      {/* 사진이 들어가는 곳 */}
      <div className='userPhoto'>
        {/* 상단에 유저 프로필, 이름, 게시글에 대한 옵션 */}
        <div className='content-box'>
          <img src={profileImage} className='profile' alt='profile' />
          <p>{posted_username}</p>

          <img src={DM_button} className='DM-button' alt='DM' onClick={handleDMClick}/> 
          <DMModal isOpen={DMmodalIsOpen} closeModal={closeDMModal} current_username = {current_user} receiver_username={posted_username} />

          {optionVisible && (
            <div className="options-menu">
              <button className='edit-button' onClick={handleEditClick}>수정</button>
              <button className='delete-button' onClick={handleDeleteClick}>삭제</button>
            </div>
          )}

          <img src={option_button} className='option-button' alt='option' onClick={handleOptionToggle}/>
        </div>

        {/* 사진이 표시되는 곳 */}
        <div className='photo-container'>
          {/* 일단 슬라이더 기능은 스킵 */}
          {/* <Slider {...settings}>
            {example_photos.map((example_photos, index) => (
              <div key = {index}>
                <img src={example_photos} className='photo' alt={`photo${index + 1}`} />
              </div>
            ))}
          </Slider> */}
          {/* <img src={photo_example1} className='photo' alt='photo' /> */}
          <img src={photos} className='photo' alt='photo' />
          {/* <img src={photo_example1} className='photo' alt='photo' /> */}
        </div>

        {/* 해시태그 달 곳 */}
        <div className='content-box'>
          <p>{hashtags.map((hashtag, index) => `#${hashtag} `)}</p>
        </div>

        {/* 사진에 대한 설명이 들어가는 곳 */}
        <div className='content-box'>
          <p>{description}</p>
        </div>
      </div>

      {/* photoEdit 모달 레이어 창 */}
      {PhotomodalIsOpen && <PhotoEdit photoId={photoId} closeModal={closePhotoModal} />}
    </div>
  );
}

export default UserPhotoComponent;
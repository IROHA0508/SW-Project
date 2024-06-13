import React, {useState} from "react";
import Slider from 'react-slick'; // 사진 슬라이더
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import './UserPhotoComponent.css';

import DM_button from './DM_button.png';
import DMModal from './DMmodal';
import PhotoEdit from './photoEdit';

import option_button from './option_button.png';

import SimpleImageSlider from "react-simple-image-slider";
import { render } from "@testing-library/react";


function UserPhotoComponent({ postId, current_user, profileImage, posted_username, photos, hashtags, description }) {
  console.log(photos)
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  }

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
    if(current_user !== posted_username){
      alert('접근 권한이 없습니다!');
      return
    }
    setPhotoModalIsOpen(true);
  };

  const closePhotoModal = () => {
    setPhotoModalIsOpen(false);
  };

  const handleDeleteClick = async () => {
    if(current_user !== posted_username){
      alert('접근 권한이 없습니다!');
      return;
    }

    if (window.confirm('이 게시물을 삭제하시겠습니까?')){
      try {
        const response = await fetch(`/api/post/${postId}`, {
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
    <div className='photocomponent-user-content'>
      <div className='photocomponent-userPhoto'>
        <div className='photocomponent-content-box1'>
          
          <div className='photocomponent-center-content'>
            <img src={profileImage} className='photocomponent-profile' alt='profile' />
            <p>{posted_username}</p>
            <img src={DM_button} className='photocomponent-DM-button' alt='DM' onClick={handleDMClick}/> 
          </div>

          <img src={option_button} className='photocomponent-option-button' alt='option' onClick={handleOptionToggle}/>
          <DMModal isOpen={DMmodalIsOpen} closeModal={closeDMModal} current_username={current_user} receiver_username={posted_username} />

          {optionVisible && (
            <div className='photocomponent-options-menu'>
              <button className='photocomponent-edit-button' onClick={handleEditClick}>수정</button>
              <button className='photocomponent-delete-button' onClick={handleDeleteClick}>삭제</button>
            </div>
          )}
        </div>

        <div className='photo-container'>
          <SimpleImageSlider
            width={896}
            height={504}
            images={photos.map(photo => ({ url: photo }))}
            showBullets={true}
            showNavs={true}
          />
        </div>

        {/* 해시태그 달 곳 */}
        <div className='photocomponent-content-box2'>
          <p>{hashtags.map((hashtag, index) => `#${hashtag} `)}</p>
        </div>

        {/* 사진에 대한 설명이 들어가는 곳 */}
        <div className='photocomponent-content-box3'>
          <p>{description}</p>
        </div>
      </div>

      {/* photoEdit 모달 레이어 창 */}
      {PhotomodalIsOpen && <PhotoEdit postId={postId} closeModal={closePhotoModal} />}
    </div>
  );
}

export default UserPhotoComponent;
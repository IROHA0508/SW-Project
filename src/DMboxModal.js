import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

import './DMboxmodal.css';
import close_button from './close_button.png';
// import close_button from './close_button.jpg';
import DMComponent from './DMComponent';

function DMboxModal({ isOpen, closeModal, current_username }) {
  const [receivedDMs, setReceivedDMs] = useState([]);

  useEffect(() => {
    fetchReceivedDM();
  }, []);

  const fetchReceivedDM = async () => {
    try {
      const response = await fetch('/api/getreceivedDM', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received DM Data:', data); // 데이터를 확인하기 위한 콘솔 로그 추가
        setReceivedDMs(data);
      } else {
        console.error('수신한 DM을 가져오는 데 실패');
      }
    } catch (error) {
      console.error('수신한 DM을 가져오는 중 오류 발생', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="DMbox Modal"
      className="custom-modal-dmbox-content"
    >

      <div className='boxmodal-header'>
        <div className='boxbig-infocontainer'>
          <div className='boxinfo-container'>
            <p><span>{current_username}</span>의 DM</p>
          </div>
        </div>
        
        <div className='boxclose-button-container'>
          <img src={close_button} className='boxclose-button' alt='close' onClick={closeModal} />
        </div>
      </div>

      <div className='box-receivedDM'>

        <div className='boxmodal-rowinformation header'>
          <div className='column profile-picture'>프로필</div>
          <div className='column sender-name'>보낸 사람</div>
          <div className='column title'>제목</div>
          <div className='column read-status'>읽음</div>
          <div className='column sent-time'>보낸 시간</div>
        </div>

        {receivedDMs.map(dm => (
          <DMComponent
            key={dm.id}
            senderName={dm.sender_name}
            title = {dm.title}
            receivedDM={dm.message}
            DMsenttime={dm.timestamp}
            DMstatus={dm.status}
          />
        ))}
      </div>
    </Modal>
  );
}

export default DMboxModal;

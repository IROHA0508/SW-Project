import React, {useState} from 'react';
import Modal from 'react-modal';

import './DMmodal.css';
import close_button from './close_button.png';
import message_send_button from './message_send_button.png';


function DMModal({ isOpen, closeModal, current_username, receiver_username }) {
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    try {
      const response = await fetch('/api/saveDM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: current_username,
          receiver: receiver_username,
          message: message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('메세지가 성공적으로 저장되었습니다.');
        setMessage('');
        closeModal();
      } else {
        alert(data.error || '메세지 전송 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('메세지 전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="DM Modal"
      className="custom-modal-content"
    >

      <div className='modal-header'>
        <div className = 'big-infocontainer'>
          <div className = 'info-container'>
            <p>보내는 사람 : {current_username}</p>
          </div>
          <div className='info-container'>
            <p> 받는 사람  : {receiver_username}</p>
          </div>
        </div>
        
        <div className = "close-button-container">
          <img src={close_button} className='close-button' alt='close' onClick={closeModal}/>
        </div>  
      </div>

      <div className="modal-message-input">
        <input
          id="message_input"
          type="text"
          placeholder="메세지를 입력하세요"
          value = {message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="sendbutton-container">
        <img 
          src={message_send_button} 
          className='message-send-button' 
          alt='send'
          onClick={sendMessage}
        />
      </div>
    </Modal>
  );
}

export default DMModal;

import React, {useState} from 'react';
import Modal from 'react-modal';

import './DMmodal.css';

function DMModal({ isOpen, closeModal, current_username, receiver_username }) {
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');

  const sendMessage = async () => {
    console.log('Sending message with title:', title);  // 디버깅용 로그 추가
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
          title: title,
        }),
      });

      const data = await response.json();
      console.log('Response from sending message:', data);  // 디버깅용 로그 추가
      if (response.ok) {
        console.log('Message sent successfully:', data);  // 디버깅용 로그 추가
        alert('메세지가 전송되었습니다.');
        setMessage('');
        setTitle('');
        closeModal();
      } else {
        console.log('Error sending message:', data.error);  // 디버깅용 로그 추가
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
        
        {/* <div className = 'close-button-container'>
          <img src={close_button} className='close-button' alt='close' onClick={closeModal}/>
        </div>   */}
      </div>

      <div className='modal-message-titleinput'>
        <input
          id="title_input"
          type="text"
          placeholder="제목을 입력하세요"
          value = {title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className='modal-message-input'>
        <textarea
          id="message_input"
          placeholder="메세지를 입력하세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className='dmmodal-button-container'>
        <button className='message-send-button' onClick={sendMessage}>Send</button>
        <button className='close-dmmodal-button' onClick={closeModal}>Close</button>
        {/* <img 
          src={message_send_button} 
          className='message-send-button' 
          alt='send'
          onClick={sendMessage}
        /> */}
      </div>
    </Modal>
  );
}

export default DMModal;

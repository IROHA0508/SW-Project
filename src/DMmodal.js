import React, {useState} from 'react';
import Modal from 'react-modal';

import './DMmodal.css';
import close_button from './close_button.png';
import message_send_button from './message_send_button.png';


function DMModal({ isOpen, closeModal, current_username, receiver_username }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (message.trim() !== "") {
      setMessages([...messages, { sender: 'me', text: message }]);
      setMessage("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="DM Modal"
      className="custom-modal-content"
    >

      <div className="modal-header">
        <div className = "big-infocontainer">
          <div id = 'senderinfo-container' className='info-container'>
            <p>보내는 사람 : {current_username}</p>
          </div>
          <div id = 'receiverinfo-container' className='info-container'>
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
          onClickCapture={sendMessage}
          // onClick={alert("메세지가 전송되었습니다")}
        />
      </div>
    </Modal>
  );
}

export default DMModal;

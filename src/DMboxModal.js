import React, {useState} from 'react';
import Modal from 'react-modal';

import './DMboxmodal.css';
import close_button from './close_button.png';


function DMboxModal({ isOpen, closeModal, current_username}) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="DMbox Modal"
      className="custom-modal-dmbox-content"
    >

      <div className="modal-header">
        <div className = "big-infocontainer">
          <div id = 'senderinfo-container' className='info-container'>
            <p>{current_username}의 DM</p>
          </div>
        </div>
        
        <div className = "close-button-container">
          <img src={close_button} className='close-button' alt='close' onClick={closeModal}/>
        </div>  
      </div>
    </Modal>
  );
}

export default DMboxModal;

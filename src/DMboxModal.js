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

      <div className='boxmodal-header'>
        <div className = 'boxbig-infocontainer'>
          <div className='bosinfo-container'>
            <p>{current_username}의 DM</p>
          </div>
        </div>
        
        <div className = 'boxclose-button-container'>
          <img src={close_button} className='boxclose-button' alt='close' onClick={closeModal}/>
        </div>  
      </div>
    </Modal>
  );
}

export default DMboxModal;

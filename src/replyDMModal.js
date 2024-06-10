import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './replyDMModal.css';
import close_button from './close_button.png';
import message_send_button from './message_send_button.png';

Modal.setAppElement('#root');

function ReplyDMModal({ isOpen, onClose, onSendReply, currentUsername, receiverUsername, originalmessage_title, originalmessage, originalmessage_senttime}) {
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState(`RE: ${originalmessage_title}`);

  useEffect(() => {
    if (isOpen) {
      setTitle(`RE: ${originalmessage_title}`);
      setMessage(`


  -----Original Message-----
  From: ${receiverUsername}
  To: ${currentUsername}
  Sent: ${originalmessage_senttime}
  Title: ${originalmessage_title}
  Message: ${originalmessage}`);
    }
  }, [isOpen, originalmessage_title, receiverUsername, currentUsername, originalmessage_senttime, originalmessage]);


  const sendMessage = async () => {
    console.log('Sending message with title:', title);
    try {
      const response = await fetch('/api/saveDM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: currentUsername,
          receiver: receiverUsername,
          message: message,
          title: title,
        }),
      });

      const data = await response.json();
      console.log('Response from sending message:', data);
      if (response.ok) {
        console.log('Message sent successfully:', data);
        alert('메세지가 성공적으로 저장되었습니다.');
        setMessage('');
        setTitle('');
        onClose();
      } else {
        console.log('Error sending message:', data.error);
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
      onRequestClose={onClose}
      contentLabel="DM Modal"
      className="custom-reply-modal-content"
    >
      <div className='reply-modal-header'>
        <div className='reply-big-infocontainer'>
          <div className='reply-info-container'>
            <p>보내는 사람: {currentUsername}</p>
          </div>
          <div className='reply-info-container'>
            <p>받는 사람: {receiverUsername}</p>
          </div>
        </div>
        <div className='reply-close-button-container'>
          <img src={close_button} className='close-button' alt='close' onClick={onClose} />
        </div>
      </div>

      <div className='reply-modal-message-titleinput'>
        <input
          id="title_input"
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className='reply-modal-message-input'>
        <textarea
        id="message_input"
        placeholder="
        
        메세지를 입력하세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className='reply-sendbutton-container'>
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

export default ReplyDMModal;

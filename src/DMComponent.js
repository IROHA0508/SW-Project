import React, { useState, useEffect } from 'react';
import './DMComponent.css';
import profile from './profile_default.jpg';
import ReplyDMModal from './replyDMModal';

function DMComponent({ senderName, receiverName, title, receivedDM, DMsenttime, DMstatus, messageId, updateMessageStatus, removeMessage }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState(DMstatus);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setStatus(DMstatus);
  }, [DMstatus]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);

    if (status === '안 읽음') {
      updateStatusToRead(messageId);
    }
  };

  const updateStatusToRead = async (messageId) => {
    console.log('Updating status for messageId:', messageId);
    try {
      const response = await fetch('/api/updateDMStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('읽음');
        updateMessageStatus(messageId, '읽음');
        console.log('Updated status:', '읽음');
      } else {
        console.error('Failed to update status:', data);
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleReply = () => {
    setIsModalOpen(true);
  };

  const handleSendReply = async (replyText) => {
    console.log('Reply button clicked for messageId:', messageId);
    try {
      const response = await fetch('/api/replyDM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, replyText }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Reply sent successfully:', data);
      } else {
        console.error('Failed to send reply:', data);
      }
    } catch (error) {
      console.error('Error replying to message:', error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    console.log('Delete button clicked for messageId:', messageId);
    try {
      const response = await fetch(`/api/deleteDM/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        removeMessage(messageId);
        console.log('Message deleted:', messageId);
      } else {
        console.error('Failed to delete message:', messageId);
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className={`DMComponent ${isExpanded ? 'expanded' : ''}`} onClick={handleToggle}>
      <div className='DMComponent-header'>
        <div className='DMComponent-profilecontainer'>
          <img src={profile} className='DMComponent-profile-image' alt='profile' />
        </div>

        <div className='DMComponent-sendername'>
          <p>{senderName}</p>
        </div>

        <div className='DMComponent-dmtitle'>
          <p>{title}</p>
        </div>

        <div className='DMComponent-dmstatus'>
          <p>{status}</p>
        </div>

        <div className='DMComponent-senttime'>
          <p>{DMsenttime}</p>
        </div>
      </div>

      {isExpanded && (
        <div className='DMComponent-dmmessage'>
          <p>{receivedDM}</p>
        </div>
      )}

      {isExpanded && (
        <div className='DMComponent-expanded-buttoncontainer'>
          <button onClick={handleReply}>답장</button>
          <button onClick={handleDelete}>삭제</button>
        </div>
      )}

      <ReplyDMModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSendReply={handleSendReply}
        currentUsername={receiverName}
        receiverUsername={senderName}
        originalmessage_title = {title}
        originalmessage = {receivedDM}
        originalmessage_senttime = {DMsenttime}
      />
    </div>
  );
}

export default DMComponent;

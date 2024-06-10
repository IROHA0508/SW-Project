import React, { useState, useEffect } from 'react';
import './DMComponent.css';
import profile from './profile_default.jpg';

function DMComponent({ senderName, title, receivedDM, DMsenttime, DMstatus, messageId, updateMessageStatus }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState(DMstatus);

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
    console.log('Updating status for messageId:', messageId);  // 로그 추가
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
        setStatus('읽음');  // 상태 업데이트
        updateMessageStatus(messageId, '읽음'); // 부모 컴포넌트의 상태도 업데이트
        console.log('Updated status:', '읽음');
      } else {
        console.error('Failed to update status:', data);
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
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
    </div>
  );
}

export default DMComponent;

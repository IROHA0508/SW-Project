import React from 'react';

import './DMComponent.css';
import profile from './profile_default.jpg';

function DMComponent({senderName, receivedDM, DMsenttime, DMstatus}) {
  return (
    <div className='DMComponent'>
      <img src={profile} className='DMComponent-profile-image' alt='profile' />
      <p>보낸 사람 : {senderName}</p>
      <div className='DMComponent-messagebox'>
        <p>내용 : {receivedDM}</p>
      </div>
      <p>보낸 시간 : {DMsenttime}</p>
      <p>읽음 여부 : {DMstatus}</p>
    </div>
  );
}

export default DMComponent;
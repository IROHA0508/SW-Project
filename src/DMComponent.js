import React from 'react';

import './DMComponent.css';
import profile from './profile_default.jpg';

function DMComponent({senderName, receivedDM, DMsenttime, DMstatus}) {
  return (
    <div className='DMComponent'>
      <div className='DMComponent-profilecontainer'>
        <img src={profile} className='DMComponent-profile-image' alt='profile' />
      </div>

      <div className='DMComponent-sendername'>
        <p>{senderName}</p>
      </div>

      <div className='DMComponent-dmtitle'>
        <p>{receivedDM}</p>
      </div>
      
      <div className='DMComponent-dmstatus'>
        <p>{DMstatus}</p>
      </div>
      
      <div className='DMComponent-senttime'>
        <p>{DMsenttime}</p>
      </div>


    </div>
  );
}

export default DMComponent;
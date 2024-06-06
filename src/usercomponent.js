import React, { useState } from 'react';

import './usercomponent.css';

function UserComponent({ profileImage, username }) {
  return (
    <div className='userlist-container'>
      <img src={profileImage} className='profile-image' alt='profile' />
      <p>{username}</p>      
    </div>
  );
}

export default UserComponent;
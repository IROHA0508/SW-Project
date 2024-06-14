import React from 'react';
import { Link } from 'react-router-dom';
import './common_header.css';

function Common_header() {
  return (
    <div className="responsive-div" id="Naviagator">

      <div className='commonheader-container'>
        <p className='kaushan-script header-text'>
          Share Your Experience, Photo and Patience
        </p>
      
        <div className='commonheader-button-container'>
            <Link to = '/aboutus' className='commonheader-button'>
              <button>About US</button>
            </Link>

            <Link to = '/signup' className='commonheader-button'>
              <button>회원가입</button>
            </Link>
        </div>
      </div>
    </div>
  );
}

export default Common_header;
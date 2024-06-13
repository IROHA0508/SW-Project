import React from 'react';
import './AboutUs.css';
import about_image from './aboutus.png';

const AboutUs = () => {
  return (
    <div className="aboutus-container">
      <img src={about_image} alt="About Us" className="aboutus-image" />
    </div>
  );
};

export default AboutUs;
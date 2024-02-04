import React, { useState, useEffect } from "react";
import './ActivityRegisterButton.css';
import { get } from "../../utilities";

const ActivityRegisterButton = (props) => {
    const [isRegistered, setIsRegistered] = useState(false);

    const handleClick = () => {
      setIsRegistered(!isRegistered);
    };
  
    return (
      <button 
        className={`ActivityRegisterButton ${isRegistered ? 'red' : ''}`} 
        onClick={handleClick}
      >
        {isRegistered ? '取消' : '报名'}
      </button>
    );  
}

export default ActivityRegisterButton;
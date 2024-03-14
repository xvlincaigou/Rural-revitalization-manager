import React from "react";

import "./NewPostInput.css";

//类别
const StoryControlButton = (props) => {
  return (
    <button type="submit" className="NewPostInput-button u-pointer" onClick={props.handleClick}>
      {props.text}
    </button>
  );
};

export default StoryControlButton;

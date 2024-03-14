import React from "react";
import "./ActivityButton.css";

const ActivityRegisterButton = (props) => {
  return (
    <button className={`ActivityButton ${props.inOrOut ? "red" : ""}`} onClick={props.handleClick}>
      {props.inOrOut ? "取消" : "报名"}
    </button>
  );
};

export default ActivityRegisterButton;

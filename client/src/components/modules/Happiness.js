import React from "react";
import "./Happiness.css";

const Happiness = (props) => {
  return (
    <div className="Happiness-container">
      <div className="Happiness-story">
        <p className="Happiness-storyContent">{props.Happiness}</p>
      </div>
    </div>
  );
};

export default Happiness;

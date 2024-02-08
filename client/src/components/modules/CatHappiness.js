import React from "react";
import "./CatHappiness.css";

/**
 * Proptypes
 * @param {int} catHappiness 
 */
const CatHappiness = (props) => {
  return (
    <div className="CatHappiness-container">
      <div className="CatHappiness-story">
        <p className="CatHappiness-storyContent">{props.catHappiness}</p>
      </div>
    </div>
  );
};

export default CatHappiness;

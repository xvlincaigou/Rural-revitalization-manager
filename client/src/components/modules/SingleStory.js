import React from "react";

/**
 * Story is a component that renders creator and content of a story
 *
 * Proptypes
 * @param {string} _id of the story
 * @param {string} creator_name
 * @param {string} creator_id
 * @param {string} content of the story
 */
const SingleStory = (props) => {
  return (
    <div className="Card-story">
      <div className="u-link u-bold">{props.creator_name}</div>
      <p className="Card-storyContent">{props.content}</p>
    </div>
  );
};

export default SingleStory;

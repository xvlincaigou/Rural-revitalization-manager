import React from "react";

/**
 * Component to render a single comment
 * @typedef creator
 * @param {string} name
 * @param {string} u_id
 *
 * Proptypes
 * @param {creator} creator
 * @param {string} content of the comment
 */
const SingleComment = (props) => {
  return (
    <div className="Card-commentBody">
      <div className="u-link u-bold">{props.creator.name}</div>
      <span>{" | " + props.content}</span>
    </div>
  );
};

export default SingleComment;

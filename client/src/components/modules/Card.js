import React, { useState, useEffect } from "react";
import SingleStory from "./SingleStory.js";
import CommentsBlock from "./CommentsBlock.js";
import { get } from "../../utilities";

import "./Card.css";

/**
 * Card is a component for displaying content like stories
 *
 * Proptypes
 * @param {string} _id of the story
 * @param {string} creator_name
 * @param {string} creator_id
 * @param {string} content of the story
 * @param {[string]} commentids id of the comments
 */
const Card = (props) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    let commentList = [];
    for (const commentid of props.commentids) {
      get("/api/comment", {commentid: commentid}).then((commentObj) => {
        commentList.push(commentObj);
        console.log(commentObj);
        console.log(commentObj.message);
        console.log("hello world!");
      });
    }
    setComments(commentList);
  }, []);

  const addNewComment = (commentObj) => {
    setComments(comments.concat([commentObj]));
  };

  return (
    <div className="Card-container">
      <SingleStory
        _id={props._id}
        creator_name={props.creator_name}
        creator_id={props.creator_id}
        content={props.content}
      />
      <CommentsBlock
        story={props}
        comments={comments}
        creator_id={props.creator_id}
        userId={props.userId}
        addNewComment={addNewComment}
      />
    </div>
  );
};

export default Card;

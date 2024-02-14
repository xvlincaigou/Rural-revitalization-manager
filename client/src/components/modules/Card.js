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
//继承了user

const Card = (props) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    let commentList = [];
    for (const commentid of props.commentids) {
      console.log("wobuhao");
      get("/api/comment", {commentid: commentid}).then((response) => {
        console.log("nihaoya");
        console.log(response.message);
        console.log(response.status);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((commentObj) => {
        commentList.push(commentObj);
        console.log(commentObj);
        console.log(commentObj.message);
      })
      .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
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
        userId={props.user}
        addNewComment={addNewComment}
      />
    </div>
  );
};

export default Card;

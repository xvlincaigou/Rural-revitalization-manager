import React, { useState, useEffect } from "react";
import SingleStory from "./SingleStory.js";
import SingleComment from "./SingleComment.js";
import { get } from "../../utilities";
import { NewComment } from "./NewPostInput.js";

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
    const commentPromises = props.commentids.map((commentid) =>
      get("/api/story/comment", {commentid: commentid})
      .catch(error => console.error('Error fetching comment:', error))
    )

    Promise.all(commentPromises)
      .then(commentResponses => {
        setComments(commentResponses.map(response => response.comment));
      })
      .catch(error => console.error('Error fetching comments:', error));
  }, []);

  const addNewComment = (commentObj) => {
    setComments(comments.concat([commentObj]));
    console.log(commentObj);
    console.log(comments);
  };

  console.log(comments);

  return (
    <div className="Card-container">
      <SingleStory
        _id={props._id}
        creator_name={props.creator_name}
        creator_id={props.creator_id}
        content={props.content}
      />
      <div className="Card-commentSection">
        <div className="story-comments">
          {comments.map((comment) => 
            (<SingleComment
              key={`SingleComment_${comment._id}`}
              _id={comment._id}
              creator={comment.creator || {name:'' , u_id:''}}
              content={comment.comment}
            />
          )
          )}
         <NewComment storyId={props._id} send_date={new Date()} addNewComment={addNewComment} creator={props.user}/>
        </div>
      </div>
    </div>
  );
};

export default Card;

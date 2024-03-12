import React, { useState, useEffect } from "react";
import axios from "axios";
import SingleStory from "./SingleStory.js";
import SingleComment from "./SingleComment.js";
import { get } from "../../utilities";
import { NewComment } from "./NewPostInput.js";
import StoryControlButton from "./StoryControlButton.js";

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
  const [canBeReplied, setCanBeReplied] = useState(props.canBeReplied);
  const [isPinned, setIsPinned] = useState(props.isPinned);

  useEffect(() => {
    const commentPromises = props.commentids.map((commentid) =>
      get("/api/story/comment", { commentid: commentid }).catch((error) =>
        console.error("Error fetching comment:", error)
      )
    );

    Promise.all(commentPromises)
      .then((commentResponses) => {
        setComments(commentResponses.map((response) => response.comment));
      })
      .catch((error) => console.error("Error fetching comments:", error));
  }, []);

  const addNewComment = (commentObj) => {
    setComments(comments.concat([commentObj]));
  };

  const handleTop = () => {
    if (props.user.role == 0) {
      alert("您没有权限！");
    } else {
      axios
        .patch("/api/story/pinned-state", { storyid: props._id, isPinned: !isPinned })
        .then((res) => {
          alert(
            res.status == 200 ? `已经${isPinned ? "取消置顶" : "置顶"}，刷新后可查看` : "失败！"
          );
          setIsPinned(!isPinned);
        })
        .catch((error) => console.error("Error:", error));
    }
  };

  const handleDelete = () => {
    if (props.user.role == 0) {
      axios
        .delete(`/api/story/${props._id}`)
        .then((res) => {
          res.status == 200 ? alert("删除成功！") : alert("删除失败！");
        })
        .catch((error) => console.error("Error:", error));
      // window.location.reload();
    } else {
      axios
        .delete(`/api/story/deleteany/${props._id}`)
        .then((res) => {
          res.status == 200 ? alert("删除成功！") : alert("删除失败！");
        })
        .catch((error) => console.error("Error:", error));
      // window.location.reload();
    }
  };

  const handleBan = () => {
    if (props.user.role == 0) {
      alert("您没有权限！");
    } else {
      axios
        .patch("/api/story/reply-feature-enabled-state", {
          storyid: props._id,
          canBeReplied: !canBeReplied,
        })
        .then((res) => {
          alert(res.status == 200 ? `已经${canBeReplied ? "禁止评论" : "允许评论"}` : "失败！");
          setCanBeReplied(!canBeReplied);
        })
        .catch((error) => console.error("Error:", error));
    }
  };

  return (
    <div className="Card-container">
      <SingleStory
        _id={props._id}
        creator_name={props.creator_name}
        creator_id={props.creator_id}
        content={props.content}
      />
      <div className="button-container">
        <StoryControlButton text={isPinned ? "取消置顶" : "置顶"} handleClick={handleTop} />
        <StoryControlButton text="删帖" handleClick={handleDelete} />
        <StoryControlButton text={canBeReplied ? "禁止评论" : "允许评论"} handleClick={handleBan} />
      </div>
      <div className="Card-commentSection">
        <div className="story-comments">
          {comments.map((comment) => (
            <SingleComment
              key={`SingleComment_${comment._id}`}
              _id={comment._id}
              creator={comment.creator || { name: "", u_id: "" }}
              content={comment.comment}
            />
          ))}
          {canBeReplied ? (
            <NewComment
              storyId={props._id}
              send_date={new Date()}
              addNewComment={addNewComment}
              creator={props.user}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Card;

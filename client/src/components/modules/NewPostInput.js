import React, { useState } from "react";

import "./NewPostInput.css";
import { post, get } from "../../utilities";
import SingleActivity from "./SingleActivity.js";

/**
 * New Post is a parent component for all input components
 *
 * Proptypes
 * @param {string} defaultText is the placeholder text
 * @param {string} storyId optional prop, used for comments
 * @param {({storyId, value}) => void} onSubmit: (function) triggered when this post is submitted, takes {storyId, value} as parameters
 */
const NewPostInput = (props) => {
  const [value, setValue] = useState("");

  // called whenever the user types in the new post input box
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  // called when the user hits "Submit" for a new post
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value) {
      alert("不能为空！");
      return;
    }
    props.onSubmit && props.onSubmit(value);
    setValue("");
  };

  return (
    <div className="u-flex">
      <input
        type="text"
        placeholder={props.defaultText}
        value={value}
        onChange={handleChange}
        className="NewPostInput-input"
      />
      <button
        type="submit"
        className="NewPostInput-button u-pointer"
        value="Submit"
        onClick={handleSubmit}
      >
        提交
      </button>
    </div>
  );
};

/**
 * New Comment is a New Post component for comments
 *
 * Proptypes
 * @param {string} defaultText is the placeholder text
 * @param {string} storyId to add comment to
 */
const NewComment = (props) => {
  const addComment = (value) => {
    const body = {
      creator: props.creator,
      send_date: props.send_date,
      story_id: props.storyId,
      comment: value,
    };
    console.log(body);
    post("/api/story/comment", body)
      .then((comment) => {
        // display this comment on the screen
        props.addNewComment(comment);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return <NewPostInput defaultText="发表你的评论吧" onSubmit={addComment} />;
};

/**
 * New Story is a New Post component for comments
 *
 * Proptypes
 * @param {string} defaultText is the placeholder text
 */
const NewStory = (props) => {
  const addStory = (value) => {
    const body = {
      creator_id: props.creator_id,
      creator_name: props.creator_name,
      title: null,
      content: value,
    };
    post("/api/story", body)
      .then((story) => {
        // display this story on the screen
        props.addNewStory(story);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return <NewPostInput defaultText="发表你的帖子吧" onSubmit={addStory} />;
};

const SearchActivity = (props) => {
  const [activity, setActivity] = useState(null);

  const search = (value) => {
    if (!value) {
      alert("不能为空！");
      return;
    }
    const body = { activity_name: value };
    get("/api/activity/search_activity", body)
      .then((activity) => {
        setActivity(
          <SingleActivity
            _id={activity._id}
            name={activity.name}
            location={activity.location}
            start_time={activity.date.start}
            end_time={activity.date.end}
            latest_register_time={activity.date.sign_up}
            capacity={activity.capacity}
            users_signed_up={activity.candidates}
            users_admin={activity.members}
            comments={activity.comments}
            supervisors={activity.supervisors}
            information={activity.intro}
            average_score={activity.score}
            user={props.user}
          />
        );
      })
      .catch((error) => {
        alert(error);
      });
  };

  return (
    <>
      <NewPostInput defaultText="搜索" onSubmit={search} />
      {activity}
    </>
  );
};

export { NewComment, NewStory, SearchActivity };

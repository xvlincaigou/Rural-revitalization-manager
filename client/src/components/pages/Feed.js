import React, { useState, useEffect } from "react";
import "./Feed.css";
import { get } from "../../utilities";

/**
 * Below are how to use story's api:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  import { NewStory } from "../modules/NewPostInput.js";
import Card from "../modules/Card.js";
  const [stories, setStories] = useState([]);

    get("/api/stories").then((storyObjs) => {
      let reversedStoryObjs = storyObjs.reverse();
      setStories(reversedStoryObjs);
    }

  // this gets called when the user pushes "Submit", so their
  // post gets added to the screen right away
  const addNewStory = (storyObj) => {
    setStories([storyObj].concat(stories));
  };

  let storiesList = null;
  const hasStories = stories.length !== 0;
  if (hasStories) {
    storiesList = stories.map((storyObj) => (
      <Card
        key={`Card_${storyObj._id}`}
        _id={storyObj._id}
        creator_name={storyObj.creator_name}
        creator_id={storyObj.creator_id}
        userId={props.userId}
        content={storyObj.content}
      />
    ));
  } else {
    storiesList = <div>No stories!</div>;
  }

      {props.userId && <NewStory addNewStory={addNewStory} />}
      {storiesList}
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

/**
 * @typedef appData
 * @property { number } activityCount
 * @property { number } postCount
 * @property { number } userCount
 * @property { number } complaintCount
 * @property { number } complaintReplyCount
 * @returns 
 */
const Feed = (props) => {

  const [appData, setAppData] = useState({});

  useEffect(() => {
    document.title = "News Feed";
    get("/api/global/appdata").then((appDataObj) => {
      setAppData(appDataObj);
    });
  }, []);

  const complaintReplyRate = appData.complaintReplyCount * 100 / appData.complaintCount;
  const formattedRate = complaintReplyRate.toFixed(2) + "%";

  return (
    <>
      <div className="Feed-subContainer u-textCenter">
        <h4>{"活动总数"}</h4>
        <div className="Feed-content">{appData.activityCount}</ div>
      </div>

      <div className="Feed-subContainer u-textCenter">
        <h4>{"帖子总数"}</h4>
        <div className="Feed-content">{appData.postCount}</div>
      </div>

      <div className="Feed-subContainer u-textCenter">
        <h4>{"用户总数"}</h4>
        <div className="Feed-content">{appData.userCount}</div>
      </div>

      <div className="Feed-subContainer u-textCenter">
        <h4>{"投诉回复率"}</h4>
        <div className="Feed-content">{formattedRate}</div>
      </div>

      <div class="link-container">
        <h4>开发者主页：</h4>
        <a class="link-item" href="https://github.com/xvlincaigou">许霖</a>
        <a class="link-item" href="https://github.com/zhaochangjack">赵畅</a>
        <a class="link-item" href="https://github.com/bbbpimasheep">刘明轩</a>
        <a class="link-item" href="https://github.com/gsk-THU">关世开</a>
      </div>
    </>
  );
};

export default Feed;

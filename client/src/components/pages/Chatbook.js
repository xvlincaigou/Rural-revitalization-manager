import React, { useEffect, useState } from "react";

import { NewStory } from "../modules/NewPostInput.js";
import Card from "../modules/Card.js";
import { get } from "../../utilities.js";
import "./Chatbook.css";

const Chatbook = (props) => {

  useEffect(() => {
    document.title = "Chatbook";
    get("/api/story/stories").then((storyObjs) => {
      let reversedStoryObjs = storyObjs.reverse();
      reversedStoryObjs.sort((a, b) => b.isPinned - a.isPinned);
      setStories(reversedStoryObjs);
    }).catch((error) => {
      console.log(error);
    });
  }, []);

  const [stories, setStories] = useState([]);

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
        user={props.user}
        content={storyObj.content}
        commentids={storyObj.comments}
        canBeReplied={storyObj.canBeReplied}
        isPinned={storyObj.isPinned}
      />
    ));
  } else {
    storiesList = <div>没有帖子！</div>;
  }

  const LifeorDeath = (command) => {
    fetch("/api/story/edit-global-settings", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({storyPostingEnabled: command}),
    })
    .then(res => {alert(res.status == 200 ? `已经${command ? "开启" : "关闭"}发帖功能` : "失败！");})
    .catch((error) => console.error('Error:', error));
  }

  if (!props.user) {
    return <div>登录以发帖</div>;
  }
  return (
    <>
      {props.user && <NewStory addNewStory={addNewStory} creator_id={props.user.u_id} creator_name={props.user.name} />}
      {storiesList}
      {props.user.role === 2 && <button className="LifeDeathButton" onClick={() => LifeorDeath(true)}>开启发帖功能</button>}
      {props.user.role === 2 && <button className="LifeDeathButton" onClick={() => LifeorDeath(false)}>关闭发帖功能</button>}
    </>
  );
}

export default Chatbook;

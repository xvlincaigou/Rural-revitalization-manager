import React, { useEffect, useState } from "react";

import { NewStory } from "../modules/NewPostInput.js";
import Card from "../modules/Card.js";
import { get } from "../../utilities.js";


const Chatbook = (props) => {

  useEffect(() => {
    document.title = "Chatbook";
    get("/api/story/stories").then((storyObjs) => {
      let reversedStoryObjs = storyObjs.reverse();
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

  if (!props.user) {
    return <div>登录以发帖</div>;
  }
  return (
    <>
      {props.user && <NewStory addNewStory={addNewStory} creator_id={props.user.u_id} creator_name={props.user.name} />}
      {storiesList}
    </>
  );
}

export default Chatbook;

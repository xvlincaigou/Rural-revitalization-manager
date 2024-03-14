import React, { useEffect, useState } from "react";
import axios from "axios";

import { NewStory } from "../modules/NewPostInput.js";
import Card from "../modules/Card.js";
import { get } from "../../utilities.js";
import "./Chatbook.css";

const Chatbook = (props) => {
  const [permitted, setPermitted] = useState(null);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    document.title = "Chatbook";
    get("/api/story/stories-page-count")
      .then((res) => {
        setMaxPage(res.pageNum);
        if (page > maxPage) {
          setPage(maxPage);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [page]);

  useEffect(() => {
    get("/api/story/stories", { page })
      .then((storyObjs) => {
        let reversedStoryObjs = storyObjs.reverse();
        reversedStoryObjs.sort((a, b) => b.isPinned - a.isPinned);
        setStories(reversedStoryObjs);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [page]);

  const changePage = (newPage) => {
    setPage(newPage);
  };

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
        canBeReplied={storyObj.canBeReplied && permitted}
        isPinned={storyObj.isPinned}
      />
    ));
  } else {
    storiesList = <div>没有帖子！</div>;
  }

  const LifeorDeath = () => {
    axios
      .put("/api/story/global-settings", { storyPostingEnabled: !permitted })
      .then((res) => {
        alert(res.status == 200 ? `已经${permitted ? "关闭" : "开启"}发帖功能` : "失败！");
        setPermitted(!permitted);
      })
      .catch((error) => console.error("Error:", error));
  };

  get("/api/story/global-settings")
    .then((res) => {
      setPermitted(res.settings.storyPostingEnabled);
    })
    .catch((error) => {
      console.log(error);
    });

  if (!props.user) {
    return <div>登录以发帖</div>;
  }
  if (permitted === null) {
    return <div>加载中...</div>;
  }
  return (
    <>
      {permitted && props.user && (
        <NewStory
          addNewStory={addNewStory}
          creator_id={props.user.u_id}
          creator_name={props.user.name}
        />
      )}
      {storiesList}
      {props.user.role === 2 && (
        <button className="LifeDeathButton" onClick={LifeorDeath}>
          {permitted ? "关闭发帖功能" : "开启发帖功能"}
        </button>
      )}
      {hasStories ? (
        <div className="page-controls">
          <button onClick={() => changePage(page - 1)} disabled={page === 1}>
            上一页
          </button>
          <button onClick={() => changePage(page + 1)} disabled={page >= maxPage}>
            下一页
          </button>
          <select value={page} onChange={(e) => changePage(e.target.value)}>
            {Array.from({ length: maxPage }, (_, i) => i + 1).map((pageNum) => (
              <option value={pageNum} key={pageNum}>
                {pageNum}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </>
  );
};

export default Chatbook;

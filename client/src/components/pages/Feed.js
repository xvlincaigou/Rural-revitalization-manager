import React, { useState, useEffect } from "react";
import "./Feed.css";
import { get } from "../../utilities";

/**
 * @typedef appData
 * @property { number } activityCount
 * @property { number } postCount
 * @property { number } userCount
 * @property { number } complaintCount
 * @property { number } complaintReplyCount
 * @returns 
 */
const Feed = () => {

  const [appData, setAppData] = useState({});

  useEffect(() => {
    document.title = "News Feed";
    get("/api/global/appdata").then((appDataObj) => {
      setAppData(appDataObj);
    }).catch((err) => {console.log(err.message);});
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

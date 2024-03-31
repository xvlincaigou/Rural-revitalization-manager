// 导入所需的库和模块
import React, { useState, useEffect } from "react";
import { get } from "../../utilities.js";
import "./Feed.css";

/**
 * Feed 组件用于显示应用的全局数据
 * @typedef appData
 * @property { number } activityCount - 活动的数量
 * @property { number } postCount - 帖子的数量
 * @property { number } userCount - 用户的数量
 * @property { number } complaintCount - 投诉的数量
 * @property { number } complaintReplyCount - 已回复的投诉的数量
 * @returns
 */
const Feed = () => {
  // appData 状态用于存储应用的全局数据
  const [appData, setAppData] = useState({});

  // 使用 useEffect 钩子函数在组件挂载后获取应用的全局数据
  useEffect(() => {
    // 设置页面标题
    document.title = "News Feed";
    // 从服务器获取应用的全局数据
    get("/api/global/appdata")
      .then((appDataObj) => {
        // 更新 appData 状态
        setAppData(appDataObj);
      })
      .catch((err) => {
        // 打印错误信息
        console.log(err.message);
      });
  }, []);

  // 计算投诉回复率并格式化为百分比
  let formattedRate = "100.00%";
  if (appData.complaintCount !== 0) {
    const complaintReplyRate = (appData.complaintReplyCount * 100) / appData.complaintCount;
    formattedRate = complaintReplyRate.toFixed(2) + "%";
  }

  return (
    <>
      <div className="Feed-subContainer u-textCenter"></div>
      <div className="Feed-subContainer u-textCenter">
        <h4>{"活动总数"}</h4>
        <div className="Feed-content">{appData.activityCount}</div>
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

    </>
  );
};

export default Feed;

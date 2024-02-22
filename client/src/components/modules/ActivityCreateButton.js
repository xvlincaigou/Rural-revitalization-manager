import React from 'react';
import Papa from 'papaparse';

import { post } from '../../utilities.js';
import "./ActivityButton.css";

const ActivityCreateButton = () => {
  const fileInputRef = React.useRef();

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          for (const activity of results.data) {
            const start_time = new Date(activity.开始时间);
            const end_time = new Date(activity.结束时间);
            const sign_up_time = new Date(activity.报名截止日期);
            const requestToPost = {
              name: activity.名称,
              location: activity.地点,
              team: activity.支队名称,
              date: {
                start: start_time,
                end: end_time,
                sign_up: sign_up_time
              },
              capacity: activity.人数上限,
              intro: activity.描述
            };
            console.log(requestToPost);
            post("/api/activity/create", requestToPost)
            .catch((err) => {
              alert(err);
              return;
            });
          }
        },
        header: true,
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv"
        onChange={handleFileChange}
      />
      <button onClick={handleButtonClick} className='ActivityCreateButton'>打开.csv文件以创建活动</button>
      <h6>时间请使用国际标准时间格式,例如：2021-01-01T00:00:00.000Z</h6>
      <h6>表头中应当按顺序排列这些信息：名称、描述、开始时间、结束时间、地点、报名截止日期、人数上限</h6>
    </div>
  );
}

export default ActivityCreateButton;
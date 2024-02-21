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
            const requestToPost = {
              name: activity.名称,
              description: activity.描述,
              startTime: activity.开始时间,
              endTime: activity.结束时间,
              location: activity.地点,
              deadline: activity.报名截止日期,
              maxPeople: activity.人数上限,
            };
            /*post("/api/activity/create", {})
            .catch((err) => {
              alert(err);
              return;
            });*/
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
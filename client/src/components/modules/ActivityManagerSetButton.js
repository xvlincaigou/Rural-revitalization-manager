import React from 'react';
import Papa from 'papaparse';

import { post , get } from '../../utilities.js';
import "./ActivityButton.css";

const ActivityManagerSetButton = () => {
  const fileInputRef = React.useRef();

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          for (const line of results.data) {
            const activityName = line.活动名称;
            const managerEmail = line.活动管理员邮箱;
            const action = "add";
            get('/api/activity/search_byname', {activity_name: activityName}).then((res) => {
              post('/api/activity/admin', {activity_id: res.activity_id, admin_email: managerEmail, action: action})
              .then((res) => console.log(res))
              .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
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
      <button onClick={handleButtonClick} className='ActivityManagerSetButton'>打开.csv文件以设置活动管理员</button>
      <h6>表头中应当按顺序排列这些信息：活动名称、活动管理员邮箱</h6>
      <h6>本按钮仅用于在活动创建之后设置活动管理员，如果您要处理的活动已经有了活动管理员，请不要使用此按钮，否则会造成混乱</h6>
      <h6>在文件中千万不要使用英文的逗号，否则会导致解析错误！</h6>
      <h6>用办公软件得把表格转化为.csv文件时不一定是UTF8编码，您可以用记事本打开.csv文件，然后选择用UTF8编码保存。否则在后台处理可能会出现乱码的问题</h6>
    </div>
  );
}

export default ActivityManagerSetButton;
import React from 'react';
import Papa from 'papaparse';

const ActivityCreateButton = (props) => {
  const fileInputRef = React.useRef();

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            complete: (results) => {
              console.log(results.data);
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
      <button onClick={handleButtonClick}>打开.csv文件以创建活动</button>
    </div>
  );
}

export default ActivityCreateButton;
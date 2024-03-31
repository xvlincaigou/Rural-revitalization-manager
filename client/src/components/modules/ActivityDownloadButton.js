import React from "react";
import axios from "axios";

import "./ActivityButton.css";

const ActivityDownloadButton = (props) => {
  const handleClick = () => {
    axios.post("/api/activity/certificate", { uid: props.uid, aid: props.aid }, {
      // This tells Axios to expect a blob response instead of the default JSON
      responseType: 'blob'
    })
      .then((response) => {
        // No need to check for status === 200, as Axios does that automatically and rejects the promise if it's not 2xx
        // Directly proceed with the response data, which is now correctly handled as a blob
        return new Blob([response.data], { type: "application/pdf" });
      })
      .then((blob) => {
        // Your blob handling code remains the same
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "certificate.pdf");
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        // Handle any errors here
        console.error('Error fetching PDF:', error);
      });
  };

  return (
    <div>
      <button className="ActivityButton" onClick={handleClick}>
        下载
      </button>
    </div>
  );
};

export default ActivityDownloadButton;

import React from "react";

import { post } from "../../utilities.js";
import "./ActivityButton.css";

const ActivityDownloadButton = (props) => {

    const handleClick = () => {
        post("/api/activity/certificate", {uid: props.uid, aid: props.aid}).then((res) => {alert(res)}).catch((error) => {alert(error);});
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
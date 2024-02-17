import React from "react";

import { get } from "../../utilities.js";
import "./ActivityButton.css";

const ActivityDownloadButton = (props) => {

    const handleClick = () => {
        get("/api/activity/certificate", {uid: props.u_id, aid: props.aid}).then((res) => {}).catch((error) => {});
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
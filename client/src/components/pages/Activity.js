import React, { useState, useEffect } from "react";
import { get } from "../../utilities";

import "../../utilities.css";
import SingleActivity from "../modules/SingleActivity.js";

const Activity = (props) => {

    const [activityList, setActivityList] = useState([]);

    useEffect(() => {
        document.title = "Activity";
        get("/api/activity").then((res) => {
            setActivityList(res);
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    if (props.user === null) {
        return <div>请先登录</div>
    }
    return (
        activityList.length === 0 ? <div>没有活动</div> : 
        activityList.map((activity) => (
            <SingleActivity
            key={`SingleActivity_${activity._id}`}
            _id={activity._id}
            name={activity.name}
            location={activity.location}
            start_time={activity.date.start}
            end_time={activity.date.end}
            latest_register_time={activity.date.sign_up}
            capacity={activity.capacity}
            users_signed_up={activity.candidates}
            users_admin={activity.members}
            comments={activity.comments}
            supervisors={activity.supervisors}
            information={activity.intro}
            average_score={activity.score}
            />
        ))
    );
}

export default Activity;


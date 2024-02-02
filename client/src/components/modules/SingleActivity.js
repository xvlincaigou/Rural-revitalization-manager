import React, { useState, useEffect } from "react";
import { get } from "../../utilities";

import "../../utilities.css";
import "./SingleActivity.css";

// 7. The register button of the activity
//Check the import is right or not for the new files.@xvlincaigou 2024/2/2

//To simple users, I think that the score, download and remark functions of the activity should be put in the homepage rather than in the activity page.
//To activity managers, I think that the functions of the activity should not be put in the activity page.
//So, in the "my home" page, we should put "activities I have registered" and "activities I manage"

/**
 * Activity is a component that renders an activity.
 *
 * Proptypes
 * @param {string} name of the activity
 * @param {string} held_time of the activity
 * @param {string} latest_register_time of the activity
 * @param {string} information of the activity
 * @param {number} number_of_people_signed_up for the activity
 * @param {string[]} users_signed_up for the activity
 * @param {number} average_score of the activity
 * @param {number} state of the activity: 0 for 已举办，1 for 报名已截止，2 for 报名中
 */

const SingleActivity = (props) => {
    return (
        <div className="Activity-container">
            <span>{props.name}</span>
            <span>举办时间：{props.held_time}</span>
            <span>报名截止时间：{props.latest_register_time}</span>
            <p className="Activity-information">{props.information}</p>
            <span>已报名人数：{props.number_of_people_signed_up}</span>
            <div>
                <span>已报名的用户：</span>
                {props.users_signed_up.map((user) => (
                    <span className="Activity-user-signed-up">{user}</span>
                ))}
            </div>
            <span>平均评分：{props.average_score}</span>
        </div>
    );
}

export default SingleActivity;
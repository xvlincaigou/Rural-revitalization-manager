import React, { useState, useEffect } from "react";
import { get } from "../../utilities";

import "../../utilities.css";
import "./SingleActivity.css";

// TODO:
// Add a button to sign up for this activity and cancel sign up for it
// How to modify the score of the activity

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
 */

const SingleActivity = (props) => {
    
    //0: you can register for it, 1: you can't register for it and the activity has not been held, 2: the activity has been held.
    const currentDateTime = new Date();
    const heldTime = new Date(props.held_time);
    const latestRegisterTime = new Date(props.latest_register_time);
    let held_time, button;
    if (latestRegisterTime > currentDateTime) {
        held_time = <div className="Activity-held-time Activity-held-time-color1">{props.held_time}</div>;
        button = <div className="Activity-button" disabled>报名</div>;
    } else if (heldTime > currentDateTime) {
        held_time = <div className="Activity-held-time Activity-held-time-color2">{props.held_time}</div>
        button = <div className="Activity-button" disabled>报名</div>;
    } else {
        held_time = <div className="Activity-held-time Activity-held-time-color3">{props.held_time}</div>
        button = <div className="Activity-button" disabled>报名</div>;
    }

    return (
        <div className="Activity-container">
            {held_time}
            <div className="Activity-Content">{props.name}</div>
            {button}
            <div className="Activity-infoSection">
                <div className="Activity-infoBody">报名截止时间{" | " + props.latest_register_time}</div>
                <div className="Activity-infoBody">活动信息{" | " + props.information}</div>
                <div className="Activity-infoBody">已报名人数{" | " + props.number_of_people_signed_up}</div>
                <div className="Activity-infoBody">平均评分{" | " + props.average_score}</div>
                <div className="Activity-infoBody">
                    <span>已报名的用户 | </span>
                    {props.users_signed_up.map((user) => (
                        <span>{user + "  "}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SingleActivity;
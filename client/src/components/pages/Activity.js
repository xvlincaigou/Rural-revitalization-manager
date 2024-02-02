import React, { useState, useEffect } from "react";
import { get } from "../../utilities";

import "../../utilities.css";
import "./Activity.css";
import "../modules/SingleActivity.js";
import SingleActivity from "../modules/SingleActivity.js";

//To simple users, I think that the score, download and remark functions of the activity should be put in the homepage rather than in the activity page.
//To activity managers, I think that the functions of the activity should not be put in the activity page.
//So, in the "my home" page, we should put "activities I have registered" and "activities I manage"

const Activity = (props) => {
    return (
        <SingleActivity 
        name="建院外包开发"
        held_time="2024/2/2"
        latest_register_time="2024/2/2"
        information="这是一个测试"
        number_of_people_signed_up={4}
        users_signed_up={["user1", "user2", "user3", "user4"]}
        average_score={100}
        />
    );
}

export default Activity;


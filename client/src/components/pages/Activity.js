import React, { useState, useEffect } from "react";
import { get } from "../../utilities";

import "../../utilities.css";
import "./Activity.css";

//An acitivity card should hold the following information:
// 1. Information regarding the activity
// 2. The latest time to sign up for the activity
// 3. The time this activity to be held
// 4.The other users who have signed up for the activity
// 5. The number of people who have signed up for the activity
// 6. The average score of people who have signed up for the activity
// 7. The register button of the activity
// 8. The state of the activity: 已举办，报名已截止，报名中

//To simple users, I think that the score, download and remark functions of the activity should be put in the homepage rather than in the activity page.
//To activity managers, I think that the functions of the activity should not be put in the activity page.
//So, in the "my home" page, we should put "activities I have registered" and "activities I manage"
const Activity = (props) => {
    return (
        <div>
            <h1>acitivity</h1>
        </div>
    );
}

export default Activity;


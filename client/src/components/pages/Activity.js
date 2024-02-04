import React, { useState, useEffect } from "react";
import { get } from "../../utilities";

import "../../utilities.css";
import SingleActivity from "../modules/SingleActivity.js";

const Activity = (props) => {
    return (
        <div>
        <SingleActivity
        name="打扫410B"
        held_time="2024/02/09"
        latest_register_time="2024/02/09"
        information="这是一个测试"
        number_of_people_signed_up={4}
        users_signed_up={["许霖", "葛冠辰", "关世开", "刘明轩"]}
        average_score={100}
        />
        <SingleActivity 
        name="建院外包开发"
        held_time="2024/02/02"
        latest_register_time="2024/02/02"
        information="这是一个测试"
        number_of_people_signed_up={4}
        users_signed_up={["许霖", "赵畅", "关世开", "刘明轩"]}
        average_score={100}
        />
        </div>
    );
}

export default Activity;


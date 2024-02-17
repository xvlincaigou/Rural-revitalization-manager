import React from "react";

import "../../utilities.css";
import "./SingleActivity.css";
import "./ActivityRegisterButton.js";
import ActivityRegisterButton from "./ActivityRegisterButton.js";

const SingleActivity = (props) => {
  
    const [inOrOut, setInOrOut] = useState(false);

    const convertToBeijingTime = (isoString) => {
        const date = new Date(isoString);
      
        const formatter = new Intl.DateTimeFormat('zh-CN', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
        const beijingTime = formatter.format(date);
      
        return beijingTime;
      }
    
    
    const handleClick = () => {
        if (inOrOut) {
            //首先要从报名的人员中删除（api？）
            //然后要在页面上渲染出来
        } else {
            //首先要加到报名的人员中（api？）
            //然后要在页面上渲染出来
        }
    };

    const currentDateTime = new Date();
    const start_time = new Date(props.start_time);
    const end_time = new Date(props.end_time);
    const latest_register_time = new Date(props.latest_register_time);
    const candidate = {u_id:props.user.u_id, name:props.user.name};
    setInOrOut(candidate in props.users_signed_up);
    let button = null, time = null;

    if (latest_register_time > currentDateTime) {
        time = <div className="Activity-held-time Activity-held-time-color1">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>;
        button = <ActivityRegisterButton candidate={candidate} inOrOut={inOrOut} handleClick={handleClick}/>;
    } else if (start_time > currentDateTime) {
        time = <div className="Activity-held-time Activity-held-time-color2">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>
    } else if (end_time > currentDateTime){
        time = <div className="Activity-held-time Activity-held-time-color3">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>
    } else {
        time = <div className="Activity-held-time Activity-held-time-color4">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>
    }

    return (
        <div className="Activity-container">
            {time}
            <div className="Activity-Content">{props.name}</div>
            {button}
            <div className="Activity-infoSection">
                <div className="Activity-infoBody">地点{" | " + props.location}</div>
                <div className="Activity-infoBody">报名截止时间{" | " + convertToBeijingTime(props.latest_register_time)}</div>
                <div className="Activity-infoBody">活动容量{" | " + props.capacity}</div>
                <div className="Activity-infoBody">活动信息{" | " + props.information}</div>
                <div className="Activity-infoBody">平均评分{" | " + props.average_score}</div>
                <div className="Activity-infoBody">
                    <span>活动管理员 | </span>
                    {props.supervisors.map((user) => (
                        <span>{user + "  "}</span>
                    ))}
                </div>
                <div className="Activity-infoBody">
                    <span>已报名的用户 | </span>
                    {props.users_signed_up.map((user) => (
                        <span>{user + "  "}</span>
                    ))}
                </div>
                <div className="Activity-infoBody">
                    <span>已被接受的用户 | </span>
                    {props.users_admin.map((user) => (
                        <span>{user + "  "}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SingleActivity;
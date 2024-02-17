import React , { useState , useEffect }from "react";

import "../../utilities.css";
import "./SingleActivity.css";
import ActivityRegisterButton from "./ActivityRegisterButton.js";
import ActivityRemarkButton from "./ActivityRemarkButton.js";
import ActivityDownloadButton from "./ActivityDownloadButton.js";
import { post } from "../../utilities.js";

const SingleActivity = (props) => {
  
    const [inOrOut, setInOrOut] = useState(false);
    const [button, setButton] = useState(null);
    const [time, setTime] = useState(null);

    useEffect(() => {
        const currentDateTime = new Date();
        const start_time = new Date(props.start_time);
        const end_time = new Date(props.end_time);
        const latest_register_time = new Date(props.latest_register_time);
        const candidate = {u_id:props.user.u_id, name:props.user.name};
        setInOrOut(candidate in props.users_signed_up);

        if (latest_register_time > currentDateTime) {//活动可以报名
            setTime(<div className="Activity-held-time Activity-held-time-color1">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
            setButton(<ActivityRegisterButton inOrOut={inOrOut} handleClick={handleClick}/>);
        } else if (start_time > currentDateTime) {//活动报名结束但是没有开始
            setTime(<div className="Activity-held-time Activity-held-time-color2">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
        } else if (end_time > currentDateTime){//活动正在进行
            setTime(<div className="Activity-held-time Activity-held-time-color3">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
        } else {//活动结束
            setTime(<div className="Activity-held-time Activity-held-time-color4">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
            //if (props.users_admin.some(user => user == candidate) || props.supervisors.some(user => user == candidate)) {
                setButton(<><ActivityDownloadButton uid={candidate.u_id} aid={props._id}/>
                <ActivityRemarkButton creator={candidate} activity_id={props._id}/></>);
            //}
            console.log(props.users_admin);
            console.log(props.supervisors);
            console.log(candidate);
        }
    }, []);

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
            post("/api/activity/unsubscribe", {uid: props.user.u_id, aid:props._id}).then((res) => {alert(res);setInOrOut(!inOrOut)}).catch((err) => {alert(err);});
        } else {
            post("/api/activity/register", {email: props.user.u_id, activity_id:props._id, name: props.user.name}).then((res) => 
            {alert(res.message);setInOrOut(!inOrOut);setButton(<ActivityRegisterButton inOrOut={inOrOut} handleClick={handleClick}/>);}).catch((err) => {alert(err);});
        }
    };

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
                        <span>{user.name + "  "}</span>
                    ))}
                </div>
                <div className="Activity-infoBody">
                    <span>已报名的用户 | </span>
                    {props.users_signed_up.map((user) => (
                        <span>{user.name + "  "}</span>
                    ))}
                </div>
                <div className="Activity-infoBody">
                    <span>已被接受的用户 | </span>
                    {props.users_admin.map((user) => (
                        <span>{user.name + "  "}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SingleActivity;
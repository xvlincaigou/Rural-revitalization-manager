import React , { useState , useEffect } from "react";

import "../../utilities.css";
import "./SingleActivity.css";
import ActivityRegisterButton from "./ActivityRegisterButton.js";
import ActivityRemarkButton from "./ActivityRemarkButton.js";
import ActivityDownloadButton from "./ActivityDownloadButton.js";
import { post } from "../../utilities.js";

const SingleActivity = (props) => {
  
    const [button, setButton] = useState(0);
    const [time, setTime] = useState(null);
    const [users_signed_up, setUsers_signed_up] = useState(props.users_signed_up);

    useEffect(() => {
        const currentDateTime = new Date();
        const start_time = new Date(props.start_time);
        const end_time = new Date(props.end_time);
        const latest_register_time = new Date(props.latest_register_time);

        let usersSignedUpIds = props.users_signed_up.map(user => user.u_id);
        let inorout = usersSignedUpIds.includes(props.user.u_id);

        if (latest_register_time > currentDateTime) {//活动可以报名
            setTime(<div className="Activity-held-time Activity-held-time-color1">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
            inorout ? setButton(11) : setButton(10);
        } else if (start_time > currentDateTime) {//活动报名结束但是没有开始
            setTime(<div className="Activity-held-time Activity-held-time-color2">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
            setButton(2);
        } else if (end_time > currentDateTime){//活动正在进行
            setTime(<div className="Activity-held-time Activity-held-time-color3">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
            setButton(3);
        } else {//活动结束
            setTime(<div className="Activity-held-time Activity-held-time-color4">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
            let usersAdminIds = props.users_admin.map(user => user.u_id);
            let supervisorsIds = props.supervisors.map(user => user.u_id);
            (supervisorsIds.includes(props.user.u_id) || usersAdminIds.includes(props.user.u_id)) ? setButton(41) : setButton(40);
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
        if (button == 11) {
            post("/api/activity/unsubscribe", {uid: props.user.u_id, aid:props._id}).then((res) => {
                alert(res);
                setButton(10);
                const newUsers_signed_up = users_signed_up.filter((user) => user.u_id !== props.user.u_id);
                setUsers_signed_up(newUsers_signed_up);})
            .catch((err) => {alert(err);});
        } else {
            post("/api/activity/subscribe", {uid: props.user.u_id, aid:props._id}).then((res) => {   
                alert(res.message);
                setButton(11);
                setUsers_signed_up([...users_signed_up, {u_id: props.user.u_id, name: props.user.name}]);})
            .catch((err) => {alert(err);});
        }
    };

    return (
        <div className="Activity-container">
            {time}
            <div className="Activity-Content">{props.name}</div>
            {
                //用一个数字表示按钮被渲染的形态。10：不在里面；11：在里面；2，3，40：啥都不渲染；41：在里面
                button == 10 ? <ActivityRegisterButton inOrOut={false} handleClick={handleClick}/> :
                button == 11 ? <ActivityRegisterButton inOrOut={true} handleClick={handleClick}/> :
                button == 41 ? <><ActivityDownloadButton uid={props.user.u_id} aid={props._id}/>
                <ActivityRemarkButton creator={{u_id: props.user.u_id, name: props.user.name}} activity_id={props._id}/></> :
                null
            }
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
                    {users_signed_up.map((user) => (
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
import React, { useState, useEffect} from 'react';
import './ManagedSingleActivityInProfile.css';
import "./SingleActivity.css";
import "./ActivityButton.css";
import ActivityDownloadButton from './ActivityDownloadButton.js';
import ActivityRemarkButton from './ActivityRemarkButton.js';

const ManagedSingleActivityInProfile = (props) => {
    const [button, setButton] = useState(false);
    const [time, setTime] = useState(null);
    const [users_admin, setUsers_admin] = useState(props.users_admin);
    const [location, setLocation] = useState(props.location);
    const [information, setInformation] = useState(props.information);
    const [start_time, setStart_time] = useState(props.start_time);
    const [end_time, setEnd_time] = useState(props.end_time);

    useEffect(() => {
        const currentDateTime = new Date();
        const start_time = new Date(props.start_time);
        const end_time = new Date(props.end_time);
        const latest_register_time = new Date(props.latest_register_time);

        if (latest_register_time > currentDateTime) {
            setTime(<div className="Activity-held-time Activity-held-time-color1">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
        } else if (start_time > currentDateTime) {
            setTime(<div className="Activity-held-time Activity-held-time-color2">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
        } else if (end_time > currentDateTime){
            setTime(<div className="Activity-held-time Activity-held-time-color3">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
        } else {
            setTime(<div className="Activity-held-time Activity-held-time-color4">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
            setButton(true);
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

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(location);
        console.log(information);
        console.log(start_time);
        console.log(end_time);
    };

    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    }

    const handleInformationChange = (event) => {
        setInformation(event.target.value);
    }

    const handleStartTimeChange = (event) => {
        setStart_time(event.target.value);
    }

    const handleEndTimeChange = (event) => {
        setEnd_time(event.target.value);
    }

    return (
        <div className="Activity-container">
            {time}
            <div className="Activity-Content">{props.name}</div>
            {
                button ? <><ActivityDownloadButton uid={props.user.u_id} aid={props._id}/>
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
                    {props.users_signed_up.map((user) => (
                        <span>{user.name + "  "}</span>
                    ))}
                </div>
                <div className="Activity-infoBody">
                    <span>已被接受的用户 | </span>
                    {users_admin.map((user) => (
                        <span>{user.name + "  "}</span>
                    ))}
                </div>
            </div>
            <form onSubmit={handleSubmit}>
                <input type="datetime-local" placeholder="修改活动开始时间" value={props.start_time} onChange={handleStartTimeChange} required />
                <input type="datetime-local" placeholder="修改活动结束时间" value={props.end_time} onChange={handleEndTimeChange} required />
                <input type="text" placeholder="修改地点" value={props.location} onChange={handleLocationChange} required />
                <input type="text" placeholder="修改活动描述" value={props.information} onChange={handleInformationChange} required />
                <button type="submit">提交</button>
            </form>
        </div>
    );
};

export default ManagedSingleActivityInProfile;
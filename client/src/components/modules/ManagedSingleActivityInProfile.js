import React, { useState, useEffect} from 'react';
import "./ActivityCard.css";
import ActivityChangeButton from './ActivityChangeButton.js';
import ActivityAdmitButton from './ActivityAdmitButton.js';

const ManagedSingleActivityInProfile = (props) => {
    const [button, setButton] = useState(0);//0:可以修改信息，可以审核报名 1:可以审核报名 2:啥都不能干
    const [time, setTime] = useState(null);

    useEffect(() => {
        const currentDateTime = new Date();
        const start_time = new Date(props.start_time);
        const end_time = new Date(props.end_time);
        const latest_register_time = new Date(props.latest_register_time);

        if (latest_register_time > currentDateTime) {
            setTime(<div className="Activity-held-time Activity-held-time-color1">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
        } else if (start_time > currentDateTime) {
            setTime(<div className="Activity-held-time Activity-held-time-color2">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
            setButton(1);
        } else if (end_time > currentDateTime){
            setTime(<div className="Activity-held-time Activity-held-time-color3">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
            setButton(2);
        } else {
            setTime(<div className="Activity-held-time Activity-held-time-color4">{convertToBeijingTime(props.start_time) + " ~ " + convertToBeijingTime(props.end_time)}</div>);
            setButton(2);
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

    return (
        <div className="Activity-container">
            {time}
            <div className="Activity-Content">{props.name}</div>
            <div className='button-container'>
            {
                button == 0 ? <><ActivityChangeButton a_id={props._id} start_time={props.start_time} end_time={props.end_time} 
                latest_register_time={props.latest_register_time} location={props.location} information={props.information} name={props.name}/>
                <ActivityAdmitButton toAdmit={props.users_signed_up.filter(element => !props.users_admin.includes(element))} activity_id={props._id}/></> :
                button == 1 ? <ActivityAdmitButton toAdmit={props.users_signed_up.filter(element => !props.users_admin.includes(element))} activity_id={props._id}/> :
                null 
            }
            </div>
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
};

export default ManagedSingleActivityInProfile;
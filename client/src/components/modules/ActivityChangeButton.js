import React , { useState }from 'react';
import { Dialog } from '@material-ui/core';

import { post } from '../../utilities.js';
import './ActivityButton.css';

const ActivityChangeButton = (props) => {

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

    const convertToUTC = (beijingDateTime) => {
        // 创建一个新的 Date 对象
        let date = new Date(beijingDateTime + ':00+08:00');
      
        // 转换为 ISO 8601 格式的 UTC 时间
        let utcDateTime = date.toISOString();
      
        return utcDateTime;
    }

    const [open, setOpen] = useState(false);
    const [start_time, setStart_time] = useState(convertToBeijingTime(props.start_time));
    const [end_time, setEnd_time] = useState(convertToBeijingTime(props.end_time));
    const [last_register_time, setLast_Register_time] = useState(convertToBeijingTime(props.latest_register_time));
    const [location, setLocation] = useState(props.location);
    const [information, setInformation] = useState(props.information);
    const [name, setName] = useState(props.name);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleStart_TimeChange = (event) => {
        setStart_time(event.target.value);
    };

    const handleEnd_TimeChange = (event) => {
        setEnd_time(event.target.value);
    };

    const handleLast_Register_TimeChange = (event) => {
        setLast_Register_time(event.target.value);
    }

    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    const handleInformationChange = (event) => {
        setInformation(event.target.value);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const new_date = {start: convertToUTC(start_time), end: convertToUTC(end_time), sign_up: convertToUTC(last_register_time)};
        post("/api/activity/update", {activity_id: props.a_id, location: location, intro: information, 
            name: name, date: new_date})
        .then((res) => {alert(res.message)})
        .catch((error) => {alert(error);});
        handleClose();
    };

    return (
        <div>
            <button className='ActivityButton' onClick={handleClickOpen}>修改活动信息</button>
            <Dialog open={open} onClose={handleClose}>
            <div className="ActivityDialogue">
                    <form onSubmit={handleSubmit}>
                        <label>活动名称</label>
                        <input type="text" placeholder="活动名称" onChange={handleNameChange} value={name}/>
                        <label>开始时间</label>
                        <input type="datetime-local" placeholder="开始时间" onChange={handleStart_TimeChange} value={start_time}/>
                        <label>结束时间</label>
                        <input type="datetime-local" placeholder="结束时间" onChange={handleEnd_TimeChange} value={end_time}/>
                        <label>最晚报名时间</label>
                        <input type="datetime-local" placeholder="最晚报名时间" onChange={handleLast_Register_TimeChange} value={last_register_time}/>
                        <label>地点</label>
                        <input type="text" placeholder="地点" onChange={handleLocationChange} value={location}/>
                        <label>活动信息</label>
                        <input type="text" placeholder="信息" onChange={handleInformationChange} value={information}/>
                        <button type="submit">提交，未填写的项不会变动</button>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}

export default ActivityChangeButton;
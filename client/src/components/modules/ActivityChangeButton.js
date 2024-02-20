import React , { useState }from 'react';
import { Dialog } from '@material-ui/core';

import { post } from '../../utilities.js';
import './ActivityButton.css';

const ActivityChangeButton = (props) => {
    const [open, setOpen] = useState(false);
    const [start_time, setStart_time] = useState("");
    const [end_time, setEnd_time] = useState("");
    const [location, setLocation] = useState("");
    const [information, setInformation] = useState("");

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

    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    const handleInformationChange = (event) => {
        setInformation(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(location);
        console.log(information);
        console.log(start_time);
        console.log(end_time);
        post("/api/activity/update", {a_id: props.a_id, location: location, information: information, start_time: start_time, end_time: end_time})
        .then((res) => {alert("修改成功")})
        .catch((error) => {alert(error);});
        handleClose();
    };

    return (
        <div>
            <button className='ActivityButton' onClick={handleClickOpen}>修改活动信息</button>
            <Dialog open={open} onClose={handleClose}>
            <div className="ActivityRemark">
                    <form onSubmit={handleSubmit}>
                        <input type="datetime-local" placeholder="开始时间" onChange={handleStart_TimeChange} />
                        <input type="datetime-local" placeholder="结束" onChange={handleEnd_TimeChange} />
                        <input type="text" placeholder="地点" onChange={handleLocationChange} />
                        <input type="text" placeholder="信息" onChange={handleInformationChange} />
                        <button type="submit">提交</button>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}

export default ActivityChangeButton;
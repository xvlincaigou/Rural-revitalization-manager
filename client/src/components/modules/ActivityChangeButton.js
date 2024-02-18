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
        //post('/api/activity/comment', {creator:props.creator, send_date: new Date(), activity_id: props.activity_id, rating: rating, comment: review});
        handleClose();
    };

    return (
        <div>
            <button className='ActivityButton' onClick={handleClickOpen}>评价</button>
            <Dialog open={open} onClose={handleClose}>
            <div className="ActivityRemark">
                    <form onSubmit={handleSubmit}>
                        <input type="time" placeholder="开始时间" value={start_time} onChange={handleStart_TimeChange} />
                        <input type="time" placeholder="结束" value={end_time} onChange={handleEnd_TimeChange} />
                        <input type="text" placeholder="地点" value={location} onChange={handleLocationChange} />
                        <input type="text" placeholder="信息" value={information} onChange={handleInformationChange} />
                        <button type="submit">提交</button>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}

export default ActivityChangeButton;
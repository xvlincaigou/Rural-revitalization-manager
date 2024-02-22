import React , { useState }from 'react';
import { Dialog } from '@material-ui/core';

import { get } from '../../utilities.js';
import './ActivityButton.css';

const ActivitySeeRemarkButton = (props) => {
    const [open, setOpen] = useState(false);
    const [activityComments, setActivityComments] = useState([]);
    const [userComments, setUserComments] = useState([]);

    const handleClickOpen = () => {
        get('/api/activity/fetch_comment', {activity_id: props.activity_id})
        .then((res) => setActivityComments(res))
        .catch((error) => console.log(error));
        get('/api/activity/member_comment', {activity_id: props.activity_id})
        .then((res) => setUserComments(res))
        .catch((error) => console.log(error));
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <button className='ActivityButton' onClick={handleClickOpen}>查看评价</button>
            <Dialog open={open} onClose={handleClose} className='ActivitySeeRemarkButtonDialog'>
                <h3>活动评论</h3>
                {activityComments.length === 0 ? <label>没有</label> : activityComments.map((comment, index) => {
                    return <label key={index}>{`${comment.creator.name}对活动评分：${comment.rating}，评论：${comment.comment}`}</label>
                })}         
                <h3>成员评论</h3>   
                {userComments.length === 0 ? <label>没有</label> : userComments.map((comment, index) => {
                    return <label key={index}>{`${comment.content.creator.name}对${comment.to_whom}评分：${comment.content.rating}，评论：${comment.content.comment}`}</label>
                })}
            </Dialog>
        </div>
    );
}

export default ActivitySeeRemarkButton;
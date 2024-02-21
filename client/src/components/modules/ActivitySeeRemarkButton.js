import React , { useState , useEffect }from 'react';
import { Dialog } from '@material-ui/core';

import { get } from '../../utilities.js';
import './ActivityButton.css';

const ActivitySeeRemarkButton = (props) => {
    const [open, setOpen] = useState(false);
    const [activityComments, setActivityComments] = useState([]);
    const [userComments, setUserComments] = useState([]);

    useEffect(() => {
        get('/api/activity/comment', {activity_id: props.activity_id})
        .then((res) => console.log(res))
        .catch((res) => console.log(res));
    }, [props.activity_id]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <button className='ActivityButton' onClick={handleClickOpen}>查看评价</button>
            <Dialog open={open} onClose={handleClose}>
                <h3>活动评论</h3>
                {activityComments.map((comment, index) => {
                    <label key={index}>{comment.creator.name}评分：{comment.rating}，评论：{comment.comment}</label>
                })}         
                <h3>成员评论</h3>   
                {userComments.map((comment, index) => {
                    <label key={index}>{comment.creator.name}评分：{comment.rating}，评论：{comment.comment}</label>
                })}
            </Dialog>
        </div>
    );
}

export default ActivitySeeRemarkButton;
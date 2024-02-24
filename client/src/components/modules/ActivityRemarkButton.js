import React , { useState }from 'react';
import { Dialog } from '@material-ui/core';

import { post } from '../../utilities.js';
import './ActivityButton.css';

//members
const ActivityRemarkButton = (props) => {
    const [open, setOpen] = useState(false);
    const [ratings, setRatings] = useState(new Array(props.members.length + 1).fill(- 1));
    const [reviews, setReviews] = useState(new Array(props.members.length + 1).fill(''));

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleRatingChange = (event, index) => {
        const newRating = [...ratings]; 
        newRating[index] = event.target.value; 
        setRatings(newRating); 
    };

    const handleReviewChange = (event, index) => {
        const newReview = [...reviews]; 
        newReview[index] = event.target.value; 
        setReviews(newReview); 
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        for (let i = 0; i < ratings.length; i ++) {
            if (reviews[i] !== '' && (ratings[i] < 0 || ratings[i] > 10)) { 
                alert('分数应在0-10之间！');
                return;
            }
            if ((ratings[i] === - 1 && reviews[i] !== '') || (ratings[i] !== - 1 && reviews[i] === '')) {
                alert('如果有评分，就需要有评论；如果有评论，就需要有评分。');
                return;
            }
        }
        post('/api/activity/comment', {creator:props.creator, send_date: new Date(), activity_id: props.activity_id, rating: ratings[0], comment: reviews[0]})
        .then((res) => alert(res.message))
        .catch((res) => console.log(res));
        for (let i = 1; i < ratings.length; i ++) {
            if (ratings[i] !== - 1) {
                post('/api/user/comment', {creator:props.creator, activity_id: props.activity_id, member_id: props.members[i - 1].u_id, rating: ratings[i], comment: reviews[i]})
                .then((res) => console.log(res.message))
                .catch((res) => console.log(res));
            }
        }
        handleClose();
    };

    return (
        <div>
            <button className='ActivityButton' onClick={handleClickOpen}>评价</button>
            <Dialog open={open} onClose={handleClose}>
            <div className="ActivityDialogue">
                    <form onSubmit={handleSubmit}>
                        <input type="number" placeholder="活动分数" value={ratings[0]} onChange={(event) => {handleRatingChange(event, 0)}} required />
                        <input type="text" placeholder="活动评论" value={reviews[0]} onChange={(event) => {handleReviewChange(event, 0)}} required />
                        {props.members.map((member, index) => (
                            <div key={index + 1}>
                                <input type="number" placeholder={`${member.name}打分`} onChange={(event) => {handleRatingChange(event, index + 1)}}/>
                                <input type="text" placeholder={`${member.name}评价`} onChange={(event) => {handleReviewChange(event, index + 1)}}/>
                            </div>
                        ))}
                        <button type="submit">提交</button>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}

export default ActivityRemarkButton;
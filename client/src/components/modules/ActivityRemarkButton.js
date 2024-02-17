import React from 'react';
import { Dialog } from '@material-ui/core';

import { post } from '../../utilities.js';
import './ActivityButton.css';

const ActivityRemarkButton = (props) => {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleRatingChange = (event) => {
        setRating(event.target.value);
    };

    const handleReviewChange = (event) => {
        setReview(event.target.value);
    };

    const handleSubmit = () => {
        if (rating < 0 || rating > 10) {
            alert('分数要在0到10之间！');
            return;
        }
        post('/api/activity/comment', {creator:props.creator, send_date: new Date(), activity_id: props.activity_id, rating: rating, comment: review});
        console.log(`Rating: ${rating}, Review: ${review}`);
        handleClose();
    };

    return (
        <div>
            <button className='ActivityButton' onClick={handleClickOpen}>评价</button>
            <Dialog open={open} onClose={handleClose}>
            <div className="ActivityRemark">
                    <form onSubmit={handleSubmit}>
                        <input type="number" placeholder="分数" value={rating} onChange={handleRatingChange} required />
                        <input type="text" placeholder="评论" value={review} onChange={handleReviewChange} required />
                        <button type="submit">提交</button>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}

export default ActivityRemarkButton;
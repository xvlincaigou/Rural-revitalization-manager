import React , { useState }from 'react';
import { Dialog } from '@material-ui/core';

import { post } from '../../utilities.js';
import './ActivityButton.css';

const ActivityAdmitButton = (props) => {
    const [open, setOpen] = useState(false);
    const [admits, setAdmits] = useState(new Array(props.members.length).fill(false));

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAdmitsChange = (event, index) => {
        const newAdmits = [...admits]; 
        newAdmits[index] = event.target.value; 
        setAdmits(newAdmits); 
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        //
        handleClose();
    };

    return (
        <div>
            <button className='ActivityButton' onClick={handleClickOpen}>评价</button>
            <Dialog open={open} onClose={handleClose}>
                <>
                    {props.members.map((member, index) => (
                        <div key={index}>
                            <label>{member.name}</label>
                            <label>{member.u_id}</label>
                            <label>{member.phoneNumber}</label>
                            <label>{"平均得分：" + activity.average_score}</label>
                            {member.activities.map((activity) => (
                                <label>{activity.name}</label>
                            ))}
                            <button onClick={(event) => handleAdmitsChange(event, index)}>同意</button>
                        </div>
                    ))}
                    <button type="submit" onClick={handleSubmit}>提交</button>
                </>
            </Dialog>
        </div>
    );
}

export default ActivityAdmitButton;
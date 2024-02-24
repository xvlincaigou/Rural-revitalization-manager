import React , { useState }from 'react';
import { Dialog } from '@material-ui/core';

import { post } from '../../utilities.js';
import "./UserButton.css";

const UserTagButton = (props) => {

    const [open, setOpen] = useState(false);
    const [tag, setTag] = useState('');
    const [visible, setVisible] = useState(0);
    //0，大家可见；1，活动管理员可见；2，常务管理员可见；3，仅系统管理员可见
    const [previousTags, setPreviousTags] = useState([]);

    const handleClickOpen = () => {
        //get previous tags
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleTagChange = (event) => {
        setTag(event.target.value);
    }

    const handleVisibleChange = (event) => {
        setVisible(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        //
        handleClose();
    };

    return (
        <div>
            <button className='UserButton' onClick={handleClickOpen}>修改</button>
            <Dialog open={open} onClose={handleClose}>
            <div className="UserDialog">
                <p>可见值：
                    0：任何人可见
                    1：活动管理员可见
                    2：常务管理员可见
                    3：仅系统管理员可见
                </p>
                    <form onSubmit={handleSubmit}>
                        <label>新标签</label>
                        <input type="text" onChange={handleNameChange} value={name}/>
                        <label>可见值</label>
                        <input type="text" onChange={handleEmailChange} value={email}/>
                        <button type="submit">提交</button>
                    </form>
                </div>
                {previousTags.length == 0 ? null : previousTags.map((tag) => {
                    return (
                        <div>
                            <p>{tag.tag}</p>
                            <p>{tag.visible}</p>
                        </div>
                    );
                })}
            </Dialog>
        </div>
    );
}

export default UserTagButton;
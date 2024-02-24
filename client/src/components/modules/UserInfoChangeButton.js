import React , { useState }from 'react';
import { Dialog } from '@material-ui/core';

import { post } from '../../utilities.js';
import "./UserButton.css";

const UserInfoChangeButton = (props) => {

    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [id_number, setId_number] = useState('');
    const [password, setPassword] = useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePhoneChange = (event) => {
        setPhone(event.target.value);
    }

    const handleId_numberChange = (event) => {
        setId_number(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

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
                    <form onSubmit={handleSubmit}>
                        <label>新名字</label>
                        <input type="text" onChange={handleNameChange} value={name}/>
                        <label>新邮箱</label>
                        <input type="text" onChange={handleEmailChange} value={email}/>
                        <label>新电话</label>
                        <input type="text" onChange={handlePhoneChange} value={phone}/>
                        <label>新身份证号码</label>
                        <input type="text" onChange={handleId_numberChange} value={id_number}/>
                        <label>新密码</label>
                        <input type="text"  onChange={handlePasswordChange} value={password}/>
                        <button type="submit">提交，未填写的项不会变动</button>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}

export default UserInfoChangeButton;
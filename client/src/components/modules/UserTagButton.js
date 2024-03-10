import React , { useState }from 'react';
import { Dialog } from '@material-ui/core';

import { post , get } from '../../utilities.js';
import "./UserButton.css";

const UserTagButton = (props) => {

    const [open, setOpen] = useState(false);
    const [tag, setTag] = useState('');
    const [visible, setVisible] = useState(0);
    //0，大家可见；1，活动管理员可见；2，常务管理员可见；3，仅系统管理员可见
    const [previousTags, setPreviousTags] = useState([]);

    const handleClickOpen = () => {
        get("/api/user/tags", {u_id: props.u_id, role: props.role, operator_id: props.operator_id})
        .then((res) => {
            setPreviousTags(res.tag_list);
            setOpen(true);
        })
        .catch(error => alert(error));
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
        if (tag == '') {
            alert('标签不能为空');
            return;
        }
        if (visible < 0 || visible > 3) {
            alert('可见值不合法');
            return;
        }
        post("/api/user/tags", {u_id: props.u_id, role: props.role, tag: tag, visibility: visible, action: 'add'})
        .then(res => alert("设置成功"))
        .catch(error => alert("设置失败"));
        handleClose();
    };

    return (
        <div>
            <button className='UserButton' onClick={handleClickOpen}>查看</button>
            <Dialog open={open} onClose={handleClose}>
            <div className="UserDialog">
                <p>{"可见值：0：任何人可见 1：活动管理员可见 2：常务管理员可见 3：仅系统管理员可见"}</p>
                    <form onSubmit={handleSubmit}>
                        <label>新标签</label>
                        <input type="text" onChange={handleTagChange} value={tag}/>
                        <label>可见值</label>
                        <input type="number" onChange={handleVisibleChange} value={visible}/>
                        <button type="submit">提交</button>
                    </form>
                    {previousTags.length == 0 ? null : previousTags.map((tag) => {
                    return <p>{tag}</p>;
                })}
                </div>
            </Dialog>
        </div>
    );
}

export default UserTagButton;
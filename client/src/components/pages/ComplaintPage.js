import React, { useState, useEffect } from "react";

import { post , get} from "../../utilities.js"; 
import "./ComplaintPage.css";

const ComplaintPage = (props) => {
    //普通用户将要发出的投诉
    const [complaint, setComplaint] = useState('');

    //管理员将要发出的回复
    const [reply, setReply] = useState('');

    //用户得到的所有回复，实际上，这些reply数据本身还是complaint
    const [replies, setReplies] = useState([]);

    //管理员要处理的全部投诉
    const [complaints, setComplaints] = useState([]);

    useEffect((props) => {
      document.title = "Complaint Page";
      //props.user.role == 0 ? 
      //get("api/complaint/reply/check").then((res) => {
      //  setReplies(res.complaint)}) :
      get ("/api/complaint").then((res) => {
        setComplaints(res.complaint);
    console.log(props.user);
    }).catch((error) => {
        console.log(error);
    });
    }, []);

    const handleInputChange = (event) => {
        setComplaint(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (complaint.length > 200 || complaint.length === 0) {
            alert('字符数过多或过少！');
        } else {
            post("/api/complaint", {sender: props.user.u_id, content: complaint}).then((res) => {
                if (res.message == "Complaint added successfully") {
                    alert('提交成功！');
                    setComplaint('');
                } else {
                    alert('提交失败！');
                }
                console.log(res);
            });
        }
        console.log('提交投诉:', complaint);
    }

    const handleReplyInputChange = (event) => {
        setReply(event.target.value);
    }

    const handleReplySubmit = (event) => {
        event.preventDefault();
        // 在这里处理提交逻辑，比如发送投诉到服务器
        if (reply.length > 200 || reply.length === 0) {
            alert('字符数过多或过少！');
        } else {
            alert('提交成功！');
            setReply('');
        }
        console.log('提交回复:', reply);
    }

    if (props.user == null) {
        return <div>请先登录</div>
    }
    if (props.user.role == 0) 
        return (
            <>
            <div className="ComplaintPage">
                <form onSubmit={handleSubmit}>
                    <label>
                        投诉内容（限制200个字符）:
                        <textarea value={complaint} onChange={handleInputChange}/>
                    </label>
                    <button type="submit">提交投诉</button>
                </form>
            </div>
            {replies.length == 0 ? <div>没有已回复的投诉</div> :
            replies.map((reply) => (
                <div className="complaint-box">
                    <div className="reply-section">
                        <h2 className="reply-name">{reply.recipient.name}</h2>
                        <span className="reply-time">{reply.recipient.timestamp}</span>
                        <p className="reply-message">{reply.reply}</p>
                    </div>
                    <div className="complaint-section">
                        <h3 className="complaint-content">投诉内容</h3>
                        <span className="complaint-time">投诉时间</span>
                    </div>
                </div>
            ))}
            </>
        );
    return (
        complaints.length == 0 ? <div>没有待回复的投诉</div> :
        complaints.map((complaint) => (
            <div className="complaint-box">
            <div className="ComplaintPage">
                <form onSubmit={handleReplySubmit}>
                    <label>
                        回复内容（限制200个字符）:
                        <textarea value={reply} onChange={handleReplyInputChange}/>
                    </label>
                    <button type="submit">提交回复</button>
                </form>
            </div>
            <div className="complaint-section">
                <h3 className="complaint-content">{complaint.content}</h3>
                <span className="complaint-time">{complaint.sender.timestamp + "    " + complaint.sender.name}</span>
            </div>
        </div>
        ))
    );
}

export default ComplaintPage;
import React, { useState, useEffect } from "react";

import { post, get } from "../../utilities.js";
import "./ComplaintPage.css";

const ComplaintPage = (props) => {
  //普通用户将要发出的投诉
  const [complaint, setComplaint] = useState("");

  //管理员将要发出的回复
  const [repliesToSend, setRepliesToSend] = useState([]);

  //用户得到的所有回复，实际上，这些reply数据本身还是complaint
  const [replies, setReplies] = useState([]);

  //管理员要处理的全部投诉
  const [complaints, setComplaints] = useState([]);

  //管理员已经处理过的投诉
  const [ansedComplaints, setAnsedComplaints] = useState([]);

  useEffect(() => {
    if (props.user && props.user.role == 0) {
      get("/api/complaint/reply/check", { uid: props.user.u_id })
        .then((res) => {
          setReplies(res.complaints);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (props.user && props.user.role != 0) {
      get("/api/complaint")
        .then((res) => {
          setComplaints(res.complaint);
        })
        .catch((err) => {
          console.log(err);
        });
      get("/api/complaint/replied/check")
        .then((res) => {
          setAnsedComplaints(res.complaints);
	  console.log("This is ansedcompl");
	  console.log(res.complaints);
	  console.log(ansedComplaints);
        })
 	.catch((err) => {
	  console.log(err);
	});
    }
  }, [props.user]);

  const handleInputChange = (event) => {
    setComplaint(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (complaint.length > 200 || complaint.length === 0) {
      alert("字符数过多或过少！");
    } else {
      const sender = {
        u_id: props.user.u_id,
        name: props.user.name,
        timestamp: new Date().toLocaleString(),
      };
      post("/api/complaint", { sender: sender, content: complaint }).then((res) => {
        if (res.message == "Complaint added successfully") {
          alert("提交成功！");
          setComplaint("");
        } else {
          alert("提交失败！");
        }
      });
    }
  };

  const handleReplyInputChange = (event, index) => {
    const newRepliesToSend = [...repliesToSend];
    newRepliesToSend[index] = event.target.value;
    setRepliesToSend(newRepliesToSend);
  };

  const handleReplySubmit = (event, index) => {
    event.preventDefault();
    if (repliesToSend[index].length > 200 || repliesToSend[index].length === 0) {
      alert("字符数过多或过少！");
    } else {
      event.preventDefault();
      const complaintId = event.target.getAttribute("complaint_id");
      post("/api/complaint/reply", {
        complaint_id: complaintId,
        reply: repliesToSend[index],
        recipient_id: props.user._id,
        recipient_name: props.user.name,
      })
        .then((res) => {
          if (res.message == "回复成功") {
            alert("提交成功！");
            setRepliesToSend((prevReplies) => prevReplies.filter((reply, i) => i !== index));
            setComplaints((prevComplaints) =>
              prevComplaints.filter((complaint) => complaint.complaint_id !== complaintId)
            );
          } else {
            alert("提交失败！");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const convertToBeijingTime = (isoString) => {
    const date = new Date(isoString);

    const formatter = new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const beijingTime = formatter.format(date);

    return beijingTime;
  };

  if (props.user == null) {
    return <div>请先登录</div>;
  }

  if (props.user.role == 0) {
    return (
      <>
        <div className="ComplaintPage">
          <form onSubmit={handleSubmit}>
            <label>
              投诉内容（限制200个字符）:
              <textarea value={complaint} onChange={handleInputChange} />
            </label>
            <button type="submit">提交投诉</button>
          </form>
        </div>
        {replies.length == 0 ? (
          <div>没有已回复的投诉</div>
        ) : (
          replies.map((reply) => (
            <div className="complaint-box">
              <div className="reply-section">
                <p>{"回复者 | " + reply.recipient.name}</p>
                <p>{"回复时间 | " + convertToBeijingTime(reply.recipient.timestamp)}</p>
                <p>{"回复内容 | " + reply.reply}</p>
              </div>
              <div className="complaint-section">
                <p>{"投诉内容 | " + reply.content}</p>
                <p>{"投诉时间 | " + convertToBeijingTime(reply.sender.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </>
    );
  }
  return complaints.length == 0 ? (
    <>
    <div>没有待回复的投诉</div>
    {ansedComplaints.length == 0 ? (
      <div>没有已回复的投诉</div>
    ) : (
      ansedComplaints.map((reply) => (
        <div className="complaint-box">
          <div className="reply-section">
            <p>{"回复者 | " + reply.recipient.name}</p>
            <p>{"回复时间 | " + convertToBeijingTime(reply.recipient.timestamp)}</p>
            <p>{"回复内容 | " + reply.reply}</p>
          </div>
          <div className="complaint-section">
            <p>{"投诉内容 | " + reply.content}</p>
            <p>{"投诉时间 | " + convertToBeijingTime(reply.sender.timestamp)}</p>
          </div>
        </div>
      ))
    )}
    </>
  ) : (
    <>
    {complaints.map((complaint, index) => (
      <div className="complaint-box" key={index}>
        <div className="ComplaintPage">
          <form onSubmit={(event) => handleReplySubmit(event, index)} complaint_id={complaint._id}>
            <label>
              回复内容（限制200个字符）:
              <textarea
                value={repliesToSend[index]}
                onChange={(event) => handleReplyInputChange(event, index)}
              />
            </label>
            <button type="submit">提交回复</button>
          </form>
        </div>
        <div className="complaint-section">
          <p>{complaint.content}</p>
          <p>{convertToBeijingTime(complaint.sender.timestamp) + "    " + complaint.sender.name}</p>
        </div>
      </div>
    ))}
    {ansedComplaints.length == 0 ? (
      <div>没有已回复的投诉</div>
    ) : (
      ansedComplaints.map((reply) => (
        <div className="complaint-box">
          <div className="reply-section">
            <p>{"回复者 | " + reply.recipient.name}</p>
            <p>{"回复时间 | " + convertToBeijingTime(reply.recipient.timestamp)}</p>
            <p>{"回复内容 | " + reply.reply}</p>
          </div>
          <div className="complaint-section">
            <p>{"投诉内容 | " + reply.content}</p>
            <p>{"投诉时间 | " + convertToBeijingTime(reply.sender.timestamp)}</p>
          </div>
        </div>
      ))
    )}
    </>  );
};

export default ComplaintPage;

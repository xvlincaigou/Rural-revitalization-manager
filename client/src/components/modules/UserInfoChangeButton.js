import React, { useState } from "react";
import { Dialog } from "@material-ui/core";

import { post } from "../../utilities.js";
import "./UserButton.css";

const UserInfoChangeButton = (props) => {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [id_number, setId_number] = useState("");
  const [password, setPassword] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const handleId_numberChange = (event) => {
    setId_number(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    post("/api/user/information", {
      u_id: props.email,
      phone_number: phone,
      id_number: id_number,
      password: password,
    })
      .then((res) => alert("修改成功"))
      .catch((error) => alert("error"));
    handleClose();
  };

  return (
    <div>
      <button className="UserButton" onClick={handleClickOpen}>
        修改
      </button>
      <Dialog open={open} onClose={handleClose}>
        <div className="UserDialog">
          <form onSubmit={handleSubmit}>
            <label>新电话</label>
            <input type="text" onChange={handlePhoneChange} value={phone} />
            <label>新身份证号码</label>
            <input type="text" onChange={handleId_numberChange} value={id_number} />
            <label>新密码</label>
            <input type="text" onChange={handlePasswordChange} value={password} />
            <button type="submit">提交，未填写的项不会变动</button>
          </form>
        </div>
      </Dialog>
    </div>
  );
};

export default UserInfoChangeButton;

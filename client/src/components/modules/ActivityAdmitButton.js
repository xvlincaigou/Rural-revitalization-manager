import React, { useState, useEffect } from "react";
import { Dialog } from "@material-ui/core";

import { post, get } from "../../utilities.js";
import "./ActivityButton.css";

const ActivityAdmitButton = (props) => {
  const [open, setOpen] = useState(false);
  const [admits, setAdmits] = useState(new Array(props.toAdmit.length).fill(false));
  const [admitsUserInfo, setAdmitsUserInfo] = useState(null);

  useEffect(() => {
    if (props.toAdmit) {
      const admitsInfoPromises = props.toAdmit.map((user) => {
        return get("/api/user/information", { u_id: user.u_id }).catch((error) =>
          console.error("Error fetching comment:", error)
        );
      });

      Promise.all(admitsInfoPromises)
        .then((admitInfoResponses) => {
          setAdmitsUserInfo(admitInfoResponses);
        })
        .catch((error) => console.error("Error fetching comments:", error));
    }
  }, [props]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAdmitsChange = (event, index) => {
    const newAdmits = [...admits];
    newAdmits[index] = true;
    setAdmits(newAdmits);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    for (let i = 0; i < admits.length; i++) {
      if (admits[i]) {
        post("/api/activity/register", {
          activity_id: props.activity_id,
          email: props.toAdmit[i].u_id,
          name: props.toAdmit[i].name,
        })
          .then((res) => {
            console.log(res.message);
          })
          .catch((err) => {
            alert(err);
          });
      }
    }
    handleClose();
  };

  return (
    <div>
      <button className="ActivityButton" onClick={handleClickOpen}>
        审核报名
      </button>
      <Dialog open={open} onClose={handleClose}>
        <>
          {admitsUserInfo
            ? admitsUserInfo.map((member, index) =>
                member == undefined ? null : (
                  <div key={index} className="ActivityAdmitDialogue">
                    <label>{member.name}</label>
                    <label>{member.u_id}</label>
                    <label>{member.phone_number}</label>
                    <label>{"平均得分：" + member.average_score}</label>
                    {member.activity_list.map((activity) => (
                      <label>{activity.name}</label>
                    ))}
                    {admits[index] ? <label color="green">同意</label> : null}
                    <button onClick={(event) => handleAdmitsChange(event, index)}>同意</button>
                  </div>
                )
              )
            : null}
          <button type="submit" onClick={handleSubmit} className="ActivityAdmitSubmitButton">
            提交
          </button>
        </>
      </Dialog>
    </div>
  );
};

export default ActivityAdmitButton;

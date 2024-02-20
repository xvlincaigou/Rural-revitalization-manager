import React, { useState, useEffect } from "react";
import CatHappiness from "../modules/CatHappiness.js";
import { get } from "../../utilities";
import SingleActivity from "../modules/SingleActivity.js";
import ManagedSinigleActivityInProfile from "../modules/ManagedSingleActivityInProfile.js";

import "../../utilities.css";
import "./Profile.css";

const Profile = (props) => {

  const [activityList, setActivityList] = useState([]);
  const [managedActivityList, setManagedActivityList] = useState([]);

    useEffect(() => {
        document.title = "Profile Page";
        get("/api/user/participate_activities", {u_id: props.user.u_id, name:props.user.name}).then((res) => {//改为返回这个用户对应的活动
            setActivityList(res);
            console.log(res);
        }).catch((error) => {
            console.log(error);
        });
        get("/api/user/supervise_activities", {u_id: props.user.u_id, name:props.user.name}).then((res) => {//改为返回这个用户对应的管理的活动
          setManagedActivityList(res);
          console.log(res);
        }).catch((error) => {
          console.log(error);
        });
    }, []);

    if (props.user === null) {
        return <div>请先登录</div>
    }
    return (
      <>
        <div
          className="Profile-avatarContainer"
        >
          <div className="Profile-avatar" />
          <div className="Profile-subContainer u-textCenter">
            <h4 className="Profile-subTitle">{"我报名过的活动数"}</h4>
            <CatHappiness catHappiness={props.user.activities.length} />
          </div>
        </div>
        <h1 className="Profile-name u-textCenter">{props.user.name}</h1>
        <hr className="Profile-linejj" />
        <div className="u-flex">
          <div className="Profile-subContainer u-textCenter">
            <h4 className="Profile-subTitle">我报名的活动</h4>
            {activityList.length === 0 ? <div>没有活动</div> : 
              activityList.map((activity) => (
              <SingleActivity
              key={`SingleActivity_${activity._id}`}
              _id={activity._id}
              name={activity.name}
              location={activity.location}
              start_time={activity.date.start}
              end_time={activity.date.end}
              latest_register_time={activity.date.sign_up}
              capacity={activity.capacity}
              users_signed_up={activity.candidates}
              users_admin={activity.members}
              comments={activity.comments}
              supervisors={activity.supervisors}
              information={activity.intro}
              average_score={activity.score}
              user={props.user}
              />
          ))}
          </div>
        <div className="Profile-subContainer u-textCenter">
            <h4 className="Profile-subTitle">我管理的活动</h4>
            {managedActivityList.length === 0 ? <div>没有活动</div> : 
              managedActivityList.map((activity) => (
              <ManagedSinigleActivityInProfile
              key={`ManagedSinigleActivityInProfile_${activity._id}`}
              _id={activity._id}
              name={activity.name}
              location={activity.location}
              start_time={activity.date.start}
              end_time={activity.date.end}
              latest_register_time={activity.date.sign_up}
              capacity={activity.capacity}
              users_signed_up={activity.candidates}
              users_admin={activity.members}
              comments={activity.comments}
              supervisors={activity.supervisors}
              information={activity.intro}
              average_score={activity.score}
              user={props.user}
              />
          ))}
          </div>
        </div>
      </>
    );
};

export default Profile;

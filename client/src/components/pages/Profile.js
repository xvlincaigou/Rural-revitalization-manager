import React, { useState, useEffect } from "react";
import CatHappiness from "../modules/CatHappiness.js";
import { get } from "../../utilities";
import SingleActivity from "../modules/SingleActivity.js";

import "../../utilities.css";
import "./Profile.css";

const Profile = (props) => {
  const [user, setUser] = useState();

  const xulinuser = {
    name: "许霖",
    activity: [
      {name:"打扫410B",
      held_time:"2024/02/09",
      latest_register_time:"2024/02/09",
      information:"这是一个测试",
      number_of_people_signed_up:4,
      users_signed_up:["许霖", "葛冠辰", "关世开", "刘明轩"],
      average_score:100
      },
      {
        name:"建院外包开发",
        held_time:"2024/02/02",
        latest_register_time:"2024/02/02",
        information:"这是一个测试",
        number_of_people_signed_up:4,
        users_signed_up:["许霖", "赵畅", "关世开", "刘明轩"],
        average_score:100
      }
    ]
  };

  useEffect(() => {
    document.title = "Profile Page";
    setUser(xulinuser) //get(`/api/user`, { userid: props.userId }).then((userObj) => setUser(userObj));
  }, []);

  if (!user) {
    return <div> Loading! </div>;
  }
  return (
    <>
      <div
        className="Profile-avatarContainer"
      >
        <div className="Profile-avatar" />
         <div className="Profile-subContainer u-textCenter">
          <h4 className="Profile-subTitle">{"我参加的活动数"}</h4>
          <CatHappiness catHappiness={user.activity.length} />
        </div>
      </div>
      <h1 className="Profile-name u-textCenter">{user.name}</h1>
      <hr className="Profile-linejj" />
      <div className="u-flex">
        <div className="Profile-subContainer u-textCenter">
          <h4 className="Profile-subTitle">我报名的活动</h4>
          <SingleActivity props={user.activity[1]} />
        </div>
       <div className="Profile-subContainer u-textCenter">
          <h4 className="Profile-subTitle">我管理的活动</h4>
        </div>
      </div>
    </>
  );
};

export default Profile;

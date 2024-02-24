import React, { useState, useEffect } from "react";
import axios from "axios";
import { get , post} from "../../utilities";
import SingleActivity from "../modules/SingleActivity.js";
import ManagedSinigleActivityInProfile from "../modules/ManagedSingleActivityInProfile.js";
import ActivityCreateButton from "../modules/ActivityCreateButton.js";
import ActivityManagerSetButton from "../modules/ActivityManagerSetButton.js";
import UserInfoChangeButton from "../modules/UserInfoChangeButton.js";

import "../../utilities.css";
import "./Profile.css";

const Profile = (props) => {

  const [activityList, setActivityList] = useState([]);
  const [managedActivityList, setManagedActivityList] = useState([]);

  const [adminUpdateEmail, setAdminUpdateEmail] = useState("");
  const [deleteUserEmail, setDeleteUserEmail] = useState("");
  const [changeUserInfoEmail, setChangeUserInfoEmail] = useState("");
  const [banUserEmail, setBanUserEmail] = useState("");
  const [tagUSerEmail, setTagUserEmail] = useState("");
  const [registerNumber, setRegisterNumber] = useState(0);

    useEffect(() => {
        document.title = "Profile Page";
        get("/api/user/participate_activities", {u_id: props.user.u_id, name:props.user.name}).then((res) => {//改为返回这个用户对应的活动
            setActivityList(res);
        }).catch((error) => {
            console.log(error);
        });
        get("/api/user/supervise_activities", {u_id: props.user.u_id, name:props.user.name}).then((res) => {//改为返回这个用户对应的管理的活动
          setManagedActivityList(res);
        }).catch((error) => {
          console.log(error);
        });
    }, []);

    const handleAdminUpdate = (event) => {
      setAdminUpdateEmail(event.target.value);
    }

    const adminUpdate = (new_state) => {
      fetch('/api/user/manage_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          u_id: adminUpdateEmail,
          promotion: new_state,
        }),
      })
      .then(res => alert(res))
      .catch((error) => {
        alert(error);
      });
    }

    const handleDeleteUser = (event) => {
      setDeleteUserEmail(event.target.value);
    }

    const deleteUser = () => {
      post('/api/user/delete', {u_id: deleteUserEmail})
      .then((res) => {alert(res)})
      .catch((error) => {
        alert(error);
      });
    }

    const handleChangeUserInfo = (event) => {
      setChangeUserInfoEmail(event.target.value);
    }

    const handleBanUser = (event) => {
      setBanUserEmail(event.target.value);
    }

    const banUser = (ban) => {
      post('/api/user/ban', {uid: banUserEmail, ban: ban})
      .then((res) => {alert(res)})
      .catch((error) => {alert(error)});
    }

    const handleTagUser = (event) => {
      setTagUserEmail(event.target.value);
    }

    const handleRegisterNumber = (event) => {
      setRegisterNumber(event.target.value);
    }

    const getRegisterNumber = () => {
      if (registerNumber <= 0 || registerNumber > 10000) {
        alert('输入的注册码数量过多或过少！');
        return;
      }
      axios.post("/api/user/requst-registration-code", {count: registerNumber})
            .then(response => {
                if (response.status == 400 || response.status == 500) {
                  throw new Error(response.data.error);
                }
                const blob = new Blob([response.data], { type: 'text/csv' });
                return blob;
            })
            .then(blob => {
                // 创建一个 Blob URL，并通过一个隐藏的 <a> 元素下载文件
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'registration_codes.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(error => {
                // 显示错误信息
                // alert(error.message || 'An error occurred');
                console.log(error);
            });
    }

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
            <div className="Happiness-container">{props.user.activities.length}</div>
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
        {props.user.role == 0 ? null : <ActivityCreateButton/>}
        {props.user.role == 2 ? <ActivityManagerSetButton/> : null}
        {props.user.role == 2 ? 
        <> 
         <hr className="Profile-linejj" />
          <div className="UserManage">
          <h4 className="Profile-subTitle">用户管理</h4>
          <div className="UserManageBlock">
            <input type="email" placeholder="增删常务管理员，输入用户邮箱" onChange={handleAdminUpdate}/>
            <button onClick={() => adminUpdate(1)}>增加</button>
            <button onClick={() => adminUpdate(0)}>删除</button>
          </div>
          <div className="UserManageBlock">
            <input type="email" placeholder="修改用户信息，输入用户邮箱" onChange={handleChangeUserInfo}/>
            <UserInfoChangeButton email={changeUserInfoEmail}>修改</UserInfoChangeButton>
          </div>
          <div className="UserManageBlock">
            <input type="email" placeholder="禁用或启用用户，输入用户邮箱" onChange={handleBanUser}/>
            <button onClick={() => banUser(1)}>禁用</button>
            <button onClick={() => banUser(0)}>启用</button>
          </div>
          <div className="UserManageBlock">
            <input type="email" placeholder="删除用户，输入用户邮箱" onChange={handleDeleteUser}/>
            <button onClick={deleteUser}>删除</button>
          </div>
          <div className="UserManageBlock">
            <input type="email" placeholder="查看用户标签，输入用户邮箱" onChange={handleTagUser}/>
            <button onClick={deleteUser}>查看</button>
          </div>
          <div className="UserManageBlock">
            <input type="number" placeholder="你想获得多少个注册码？" onChange={handleRegisterNumber}/>
            <button onClick={getRegisterNumber}>获取</button>
          </div>
          </div>
          </> : 
          <> 
          <hr className="Profile-linejj" />
           <div className="UserManage">
           <h4 className="Profile-subTitle">用户管理</h4>
           <div className="UserManageBlock">
             <input type="email" placeholder="查看用户标签，输入用户邮箱" onChange={handleTagUser}/>
             <button onClick={deleteUser}>查看</button>
           </div>
           </div>
           </>
          }
      </>
    );
};

export default Profile;

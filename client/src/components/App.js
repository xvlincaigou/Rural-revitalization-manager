import React, { useState, useEffect } from "react";
import axios from 'axios';
import NavBar from "./modules/NavBar.js";
import { Router } from "@reach/router";
import Feed from "./pages/Feed.js";
import NotFound from "./pages/NotFound.js";
import Profile from "./pages/Profile.js";
import Chatbook from "./pages/Chatbook.js";
import Activity from "./pages/Activity.js";
import Register from "./pages/Register.js";
import ComplaintPage from "./pages/ComplaintPage.js";

import { post } from "../utilities";

import "../utilities.css";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    if(!user) return;
    console.log("Logged out successfully!");
    setUser(null);
    localStorage.removeItem('user');
    post("/api/logout").then((res) => {
      alert(res.message);
    }).catch((err) => {
      console.log(err);
    });
  };

  useEffect(() => {
    // console.log("Setting up interceptor");
    const interceptor = axios.interceptors.response.use(
      response => {
        // console.log("Axios response:", response);
        // 如果响应是成功的，直接返回响应
        return response;
      },
      error => {
        // console.error("Axios error:", error);
        // 如果响应是错误的，检查错误消息
        if (error.response && (error.response.data.message === "令牌无效！" || error.response.data.message === "没有找到令牌！")) {
          // 弹出警告窗口并提示用户登出
          alert("登录已过期，请重新登录！");
          handleLogout();
        }

        // 抛出错误，以便你可以在你的代码中继续处理它
        return Promise.reject(error);
      }
    );

    // 当组件卸载时，移除拦截器
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [handleLogout]);

  useEffect(() => {
    // 从本地读取用户数据
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUser(user);
    }
  }, []);

  const logInPut = (val) => {
    setUser(val);
  }

  return (
    <>
      <NavBar user={user} handleLogout={handleLogout} />
      <div className="App-container">
        <Router>
          <Feed path="/" />
          <Profile path="/profile/:user.u_id" user={user} />
          <Chatbook path="/chat/" user={user} />
          <Activity path="/activity/" user={user} />
          <Register path="/register/" upload={logInPut} />
          <ComplaintPage path="/complaint/" user={user} />
          <NotFound default />
        </Router>
      </div>
    </>
  );
};

export default App;

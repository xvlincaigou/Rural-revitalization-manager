import React, { useState } from "react";
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
  const [userId, setUserId] = useState(null);

  const handleLogin = (res) => {
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
    });
  };

  const handleLogout = () => {
    console.log("Logged out successfully!");
    setUserId(null);
    post("/api/logout");
  };

  const logInPut = (val) => {
    setUserId(val);
  }

  return (
    <>
      <NavBar handleLogin={handleLogin} handleLogout={handleLogout} userId={userId} />
      <div className="App-container">
        <Router>
          <Feed path="/" userId={userId} />
          <Profile path="/profile/" />
          <Chatbook path="/chat/" userId={userId} />
          <Activity path="/activity/"/>
          <Register path="/register/" upload={logInPut}/>
          <ComplaintPage path="/complaint/" userId={userId} />
          <NotFound default />
        </Router>
      </div>
    </>
  );
};

export default App;

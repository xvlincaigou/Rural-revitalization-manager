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
  const [user, setUser] = useState(null);

  const handleLogin = (res) => {
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      setUser(user);
    });
  };

  const handleLogout = () => {
    console.log("Logged out successfully!");
    setUser(null);
    post("/api/logout");
  };

  const logInPut = (val) => {
    setUser(val);
  }

  return (
    <>
      <NavBar handleLogin={handleLogin} handleLogout={handleLogout} user={user} />
      <div className="App-container">
        <Router>
          <Feed path="/" />
          <Profile path="/profile/:user.u_id" user={user}/>
          <Chatbook path="/chat/" user={user} />
          <Activity path="/activity/" user={user}/>
          <Register path="/register/" upload={logInPut}/>
          <ComplaintPage path="/complaint/" user={user} />
          <NotFound default />
        </Router>
      </div>
    </>
  );
};

export default App;

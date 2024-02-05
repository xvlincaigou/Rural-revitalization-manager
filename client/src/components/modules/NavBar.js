import React from "react";
import { Link } from "@reach/router";


import "./NavBar.css";
import LogIn from "./LogIn.js";

/**
 * The navigation bar at the top of all pages. Takes no props.
 */
const NavBar = (props) => {
  return (
    <nav className="NavBar-container">
      <div className="NavBar-linkContainer u-inlineBlock">
      <div className="NavBar-logo"></div>
        <Link to="/" className="NavBar-link">
          主页
        </Link>
        {props.userId && (
          <Link to={`/profile/${props.userId}`} className="NavBar-link">
            我的
          </Link>
        )}
        <Link to="/chat/" className="NavBar-link">
          发帖
        </Link>
        <Link to="/activity/" className="NavBar-link">
          活动
        </Link>
        <Link to="/register/" className="NavBar-link">
          注册
        </Link>
        {<LogIn />
        /*props.userId ? (
          <GoogleLogout
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Logout"
            onLogoutSuccess={props.handleLogout}
            onFailure={(err) => console.log(err)}
            className="NavBar-link NavBar-login"
          />
        ) : (
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Login"
            onSuccess={props.handleLogin}
            onFailure={(err) => console.log(err)}
            className="NavBar-link NavBar-login"
          />
        )*/}
      </div>
    </nav>
  );
};

export default NavBar;
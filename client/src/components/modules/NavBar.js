import React from "react";
import { Link } from "@reach/router";


import "./NavBar.css";

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
          <Link to={"/profile/"} className="NavBar-link">
            我的
          </Link>
        <Link to="/chat/" className="NavBar-link">
          发帖
        </Link>
        <Link to="/activity/" className="NavBar-link">
          活动
        </Link>
        <Link to="/complaint/" className="NavBar-link">
          投诉
        </Link>
        <Link to="/register/" className="NavBar-link">
          注册/登录
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
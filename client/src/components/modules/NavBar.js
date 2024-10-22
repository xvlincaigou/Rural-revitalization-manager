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
        {props.user && (
          <Link to={`/profile/${props.user.u_id}`} className="NavBar-link">
            我的
          </Link>
        )}
        {props.user && (
          <Link to={"/chat/"} className="NavBar-link">
            发帖
          </Link>
        )}
        {props.user && (
          <Link to={"/activity/"} className="NavBar-link">
            活动
          </Link>
        )}
        {props.user && (
          <Link to={"/complaint/"} className="NavBar-link">
            投诉
          </Link>
        )}
        {!props.user && (
          <Link to={"/register/"} className="NavBar-link">
            注册/登录
          </Link>
        )}
        {props.user && (
          <Link to={"/"} onClick={props.handleLogout} className="NavBar-link">
            登出
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

import React, { useState, useEffect } from "react";
import { get } from "../../utilities";

import "../../utilities.css";
import SingleActivity from "../modules/SingleActivity.js";
import { SearchActivity } from "../modules/NewPostInput.js";

const Activity = (props) => {
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [activityList, setActivityList] = useState([]);

    useEffect(() => {
        document.title = "Activity";
        get("/api/activity/activities-page-count").then((res) => {
            setMaxPage(res.pageNum);
            if (page > maxPage) {
                setPage(maxPage);
            }
        }).catch((error) => {
            console.log(error);
        });
    }, [page]);

    useEffect(() => {
        document.title = "Activity";
        get("/api/activity", { page }).then((res) => {
            setActivityList(res);
        }).catch((error) => {
            console.log(error);
        });
    }, [page]);

    const changePage = (newPage) => {
        setPage(newPage);
    };

    if (props.user === null) {
        return <div>请先登录</div>
    }
    return (
        <>
            {activityList.length === 0 ? <div>没有活动</div> :
            <>
            <SearchActivity />
            {activityList.map((activity) => (
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
            <div className="page-controls">
                <button onClick={() => changePage(page - 1)} disabled={page === 1}>上一页</button>
                <button onClick={() => changePage(page + 1)} disabled={page >= maxPage}>下一页</button>
                <select value={page} onChange={(e) => changePage(e.target.value)}>
                    {Array.from({ length: maxPage }, (_, i) => i + 1).map((pageNum) => (
                        <option value={pageNum} key={pageNum}>
                            {pageNum}
                        </option>
                    ))}
                </select>
            </div>
            </>
            }
        </>
    );
}

export default Activity;


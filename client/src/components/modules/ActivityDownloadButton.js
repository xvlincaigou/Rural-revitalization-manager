import React from "react";
import axios from "axios";

import "./ActivityButton.css";

const ActivityDownloadButton = (props) => {

    const handleClick = () => {
        axios.post("/api/activity/certificate", { uid: props.uid, aid: props.aid })
            .then(response => {
                if (!response.ok) {
                    // 请求失败，尝试解析错误信息
                    return response.json().then(error => Promise.reject(error));
                }
                // 请求成功，获取 PDF 文件的数据
                return response.blob();
            })
            .then(blob => {
                // 创建一个 Blob URL，并通过一个隐藏的 <a> 元素下载文件
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'certificate.pdf');
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(error => {
                // 显示错误信息
                // alert(error.message || 'An error occurred');
                console.log(error);
            });
    };

    return (
        <div>
            <button className="ActivityButton" onClick={handleClick}>
                下载
            </button>
        </div>
    );
};

export default ActivityDownloadButton;
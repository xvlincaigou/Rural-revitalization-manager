import React from 'react';

const SingleActivityInProfile = ({ title, description, date }) => {
    return (
        <div className="activity">
            <h3>{title}</h3>
            <p>{description}</p>
            <p>{date}</p>
        </div>
    );
};

export default SingleActivityInProfile;
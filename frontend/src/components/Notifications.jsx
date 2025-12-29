import React from 'react';
import logo from '../assets/logo.png';

const Notifications = () => {
  
  const notifications = [
    { img: logo, name: "Vijay", time: "2 mins ago", message: "accepted to assist with your problem statement" },
    { img: logo, name: "Rahul", time: "10 mins ago", message: "commented on your post" },
    { img: logo, name: "Sneha", time: "30 mins ago", message: "liked your solution" },
    { img: logo, name: "Rohit", time: "1 hour ago", message: "started following you" },
    { img: logo, name: "Kiran", time: "Yesterday", message: "requested help from you" },
    { img: logo, name: "Pooja", time: "Yesterday", message: "upvoted your answer" }
  ];

  return (
    <div className="container mt-4 p-3">

      <h3 className="fw-bold mb-3">Notifications</h3>

      <div className="card shadow-sm p-3 rounded-4 border-0">

        {notifications.map((n, index) => (
          <div 
            key={index} 
            className="d-flex align-items-center p-3 mb-2 border-bottom"
            style={{ cursor: "pointer" }}
          >
            <img 
              src={n.img} 
              alt="profile"
              className="rounded-circle"
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />

            <div className="ms-3">
              <span className="fw-semibold">{n.name}</span>{" "}
              <span className="text-muted">{n.message}</span>
              <div className="small text-secondary">{n.time}</div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Notifications;

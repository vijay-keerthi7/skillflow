import React, { createContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

export const usersContext = createContext();

const UsersProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const socket = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem('skillflow_user'));
    const currentUserId = currentUser?._id || currentUser?.id;

    // 1. Initial Fetch & Socket Connection
    useEffect(() => {
        if (!currentUserId) return;

        const fetchUsers = async () => {
            try {
                // Fixed: process.env added
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/all-users/${currentUserId}`);
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();

        // FIXED: Added process.env. and removed unnecessary template literal backticks
        // Also added a fallback to localhost:5000 just in case
        const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
        
        socket.current = io(socketUrl, {
            query: { userId: currentUserId }
        });

        socket.current.on("getOnlineUsers", (userIds) => setOnlineUsers(userIds));

        return () => {
            if (socket.current) {
                socket.current.off("getOnlineUsers");
                socket.current.disconnect();
            }
        };
    }, [currentUserId]);

    // 2. Real-time Events (Global state management)
    useEffect(() => {
        if (!socket.current || !currentUserId) return;

        const handleProfileUpdate = (updatedUser) => {
            setUsers((prevUsers) => 
                prevUsers.map((u) => u._id === updatedUser._id ? { ...u, ...updatedUser } : u)
            );
        };

        const handleMessagesRead = ({ readerId }) => {
            setUsers((prevUsers) => 
                prevUsers.map((u) => u._id === readerId ? { ...u, lastMessageStatus: 'read' } : u)
            );
        };

        socket.current.on("userProfileUpdated", handleProfileUpdate);
        socket.current.on("messagesRead", handleMessagesRead);
        
        return () => {
            socket.current?.off("userProfileUpdated", handleProfileUpdate);
            socket.current?.off("messagesRead", handleMessagesRead);
        };
    }, [currentUserId, socket.current]); // Added socket.current to dependency

    return (
        <usersContext.Provider value={{ users, setUsers, loading, onlineUsers, socket: socket.current }}>
            {children}
        </usersContext.Provider>
    );
};

export default UsersProvider;
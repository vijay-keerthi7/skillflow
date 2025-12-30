import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
export const usersContext = createContext();

const UsersProvider = ({ children }) => {
    // 1. Change 'users' from a variable to State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
const [onlineUsers, setOnlineUsers] = useState([]); // New state for real-time status
const currentUser = JSON.parse(localStorage.getItem('skillflow_user'));

    useEffect(() => {
    if (currentUser) {
      // Connect to socket globally for presence
      const socket = io("http://localhost:5000", {
        query: { userId: currentUser._id || currentUser.id }
      });

      // Listen for the list of online user IDs from the server
      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => socket.close();
    }
  }, []);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // 2. Fetch from your backend
                const res = await axios.get('http://localhost:5000/api/auth/all-users');
                
                // 3. Update the state with real DB users
                setUsers(res.data);
            } catch (error) {
                console.error("Error fetching users from DB:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        // 4. Pass users (and loading if you want) to the provider
        <usersContext.Provider value={{ users, loading ,onlineUsers }}>
            {children}
        </usersContext.Provider>
    );
};

export default UsersProvider;
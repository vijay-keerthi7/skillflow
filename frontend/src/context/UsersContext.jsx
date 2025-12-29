import React,{ createContext} from "react";
export const usersContext= createContext();

const UsersProvider=({children})=>{
    const users=
[
  {
    "id": 1,
    "name": "Arjun Mehta",
    "username": "arjun_codes",
    "profilepic": "https://i.pravatar.cc/150?u=arjun",
    "status": "online",
    "lastseen": "Active now"
  },
  {
    "id": 2,
    "name": "Ananya Sharma",
    "username": "ananya_pixels",
    "profilepic": "https://i.pravatar.cc/150?u=ananya",
    "status": "offline",
    "lastseen": "2 hours ago"
  },
  {
    "id": 3,
    "name": "Vihaan Iyer",
    "username": "vihaan_vibe",
    "profilepic": "https://i.pravatar.cc/150?u=vihaan",
    "status": "online",
    "lastseen": "Active now"
  },
  {
    "id": 4,
    "name": "Saanvi Kulkarni",
    "username": "saanvi_writes",
    "profilepic": "https://i.pravatar.cc/150?u=saanvi",
    "status": "offline",
    "lastseen": "Yesterday at 10:30 PM"
  },
  {
    "id": 5,
    "name": "Rohan Malhotra",
    "username": "rohan_travels",
    "profilepic": "https://i.pravatar.cc/150?u=rohan",
    "status": "online",
    "lastseen": "Active now"
  },
  {
    "id": 6,
    "name": "Ishani Das",
    "username": "ishani_d",
    "profilepic": "https://i.pravatar.cc/150?u=ishani",
    "status": "offline",
    "lastseen": "5 mins ago"
  },
  {
    "id": 7,
    "name": "Aditya Reddy",
    "username": "adi_techie",
    "profilepic": "https://i.pravatar.cc/150?u=aditya",
    "status": "online",
    "lastseen": "Active now"
  },
  {
    "id": 8,
    "name": "Kavya Nair",
    "username": "kavya_art",
    "profilepic": "https://i.pravatar.cc/150?u=kavya",
    "status": "offline",
    "lastseen": "3 days ago"
  },
  {
    "id": 9,
    "name": "Kabir Singh",
    "username": "kabir_fitness",
    "profilepic": "https://i.pravatar.cc/150?u=kabir",
    "status": "online",
    "lastseen": "Active now"
  },
  {
    "id": 10,
    "name": "Diya Mukherjee",
    "username": "diya_m",
    "profilepic": "https://i.pravatar.cc/150?u=diya",
    "status": "offline",
    "lastseen": "45 mins ago"
  }
];
  

    return (
        <usersContext.Provider value={users}>
            {children}
        </usersContext.Provider>
    );

};

export default UsersProvider;


import logo from "../assets/logo.png";
import sampleImage from "../assets/sample-doubt.png";
import userPic from "../assets/userPic.jpeg"; // add your image

export const doubts = [
  {
    id: 1,
    name: "Vijay",
    img: logo,
    title: "How to make API request in Postman?",
    status: "Needs help",
    doubtImage: sampleImage,
    likes: 30,
    comments: 10,
    time: "Yesterday",
    sharecount: 23,
    liked: false,

    commentsList: [
      {
        name: "Rahul Bharadwaj",
        userPic,
        text: "Very difficult one, I also experienced this several times!"
      },
      {
        name: "Priya Sharma",
        userPic,
        text: "I faced this issue last week. Clearing cache fixed it for me."
      },
      {
        name: "Aman Verma",
        userPic,
        text: "Try checking your API headers once, might be missing something."
      },
      {
        name: "Sneha Reddy",
        userPic,
        text: "Good question! Following to learn the solution."
      }
    ],

    likesList: [
      { id: 1, name: "Rahul Bharadwaj", userPic },
      { id: 2, name: "Priya Sharma", userPic },
      { id: 3, name: "Aman Verma", userPic },
      { id: 4, name: "Sneha Reddy", userPic },
      { id: 5, name: "Vikas Mehta", userPic }
    ]
  },

  {
    id: 2,
    name: "Rohit",
    img: logo,
    title: "Why am I getting CORS error in React?",
    status: "Needs help",
    doubtImage: sampleImage,
    likes: 45,
    comments: 6,
    time: "1 week ago",
    sharecount: 10,
    liked: false,

    commentsList: [
      { name: "Harsh Patel", userPic, text: "Check server headers!" },
      { name: "Divya Sahoo", userPic, text: "This is definitely CORS issue." }
    ],

    likesList: [
      { id: 1, name: "Harsh Patel", userPic },
      { id: 2, name: "Divya Sahoo", userPic }
    ]
  }
];

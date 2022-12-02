import { React, useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../store/login/login";
import { json, Link } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import "./Chat.css";
let Chat = () => {
  //Redux Use redux react toolkit
  const islogin = useSelector((state) => state.login.value);
  const dispatch = useDispatch();
  const [socketid, setSocketid] = useState({});
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reciver, setReciver] = useState("");

  //State for Chat Message Box
  const [msg, setMsg] = useState("");
  const handlechange = (event) => {
    setMsg(event.target.value);
  };

  //Make Web Socket Connection With Backend
  useEffect(() => {
    const newsocket = io("127.0.0.1:4000", {
      auth: {
        userid: localStorage.getItem("id"),
        token: localStorage.getItem("token"),
      },
    });
    setSocket(newsocket);
    return () => {
      newsocket.close();
    };
  }, []);

  //Fetch User (Friends List)
  useEffect(() => {
    var data = JSON.stringify({
      id: localStorage.getItem("id"),
      token: localStorage.getItem("token"),
    });

    var config = {
      method: "post",
      url: "http://localhost:4000/backendapi/chat/fetchcontact",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        setChats(response.data);
        setSocketid(JSON.parse(localStorage.getItem("Chats")));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  const messageRef = useRef();

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);

  //Helper Function that Return userDetails Window
  const userDetails = (user) => {
    return (
      <div
        className="user_details"
        onClick={(event) => {
          openMessageWindow(event, user._id);
        }}
      >
        <div className="photo">
          <img src={user.photo} />
        </div>
        <div className="user_details_name_time">
          <div className="name">
            <div>{user.name}</div>
            <div>Time</div>
          </div>
          <div className="last_message">Hii</div>
        </div>
      </div>
    );
  };

  //Individual Message
  const chat = (message) => {
    console.log(message);
    if (localStorage.getItem("id") != message.sender) {
      return (
        <div className="right_head">
          <h4 className="new_message right">{message.data}</h4>
        </div>
      );
    } else {
      return (
        <div className="right_head right">
          <h4 className="new_message">{message.data}</h4>
        </div>
      );
    }
    // return(<div>hello</div>)
    // </div>
    // );
  };

  //Chat Area
  const userChats = (Chats) => {
    return (
      <div className="chat_details  ">
        <div className="oldchat">
          {Chats.map(chat)}
          <div ref={messageRef}></div>
        </div>
        <div className="send_message">
          <input type="text" name="msg" onChange={handlechange}></input>
          <button onClick={send_message}>Send Message</button>
        </div>
      </div>
    );
  };

  const openMessageWindow = (event, rec) => {
    socket.on("message", (data) => {
      setMessages(data.conversations);
      setReciver(rec);
    });
    socket.emit("fetch_message_byid", socketid[rec], "2");
    // socket.emit('create_message','637b4e231a68c0c26f074a85','637b4de71a68c0c26f074a83','Hii Brother');
    // socket.emit('unseen_message','637b47dc51126d4f5d350d78','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzN2I0N2RjNTExMjZkNGY1ZDM1MGQ3OCIsImlhdCI6MTY2OTI2NjAyOH0.w8-OpdEvMAf-zEM8762dph9l6c-_UFS94YYzQ3KRyKo');
  };

  //Send New Message
  const send_message = () => {
    let sender = localStorage.getItem("id");
    socket.emit("create_message", sender, reciver, msg);
  };

  //Litening for New Message
  socket &&
    socket.on("new_message", (ms) => {
      setMessages([...messages, ms]);
    });

  //Join All rooms
  socket &&
    chats.length > 0 &&
    socket.emit("join_all_rooms", localStorage.getItem("id"));

  return (
    <div>
      <div className="container-fluid chat-container">
        <div className="row chat_window">
          <div className="col-md-6 col-sm-12">{chats.map(userDetails)}</div>
          <div className="col-md-6 col-sm-12">{userChats(messages)}</div>
        </div>
      </div>
    </div>
  );
};
export default Chat;

import React, { useState, useEffect, useRef } from "react";
import "../styles/login.css";
import axios from "axios";
import { Link } from "react-router-dom";

const backendPort = process.env.REACT_APP_BACKEND_PORT;

const LoginPage = () => {

  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleOnClick = async (e) => {
    try {
        e.preventDefault();
        const response = await axios.post(`http://localhost:${backendPort}/login`, {
            username,
            password
        });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            alert('Login Successful');
            window.location.href = '/';
          } else {
            alert('Login failed. Invalid credentials.');
          }   
    } catch (error) {
      console.error("Error:", error);
      alert( error);
    }
  }

  const handlePasswordChange = (event) => {
    event.preventDefault();
    setPassword(event.target.value);
  }
  const handleUsernameChange = (event) => {
    event.preventDefault();
    setUsername(event.target.value);
  }

  return (
    <>
      <div className="login-main-container">
         <div className='login-container'>
         <h1>Login</h1>
            <div className="form">
             <input type="text" className="password" placeholder="Username" onChange={handleUsernameChange}></input>
              <input type="password" className="password" placeholder="Password" onChange={handlePasswordChange}></input>
              <button type='submit' onClick={handleOnClick}> Login</button>
            </div>
         </div>
        
      </div>
    </>
  );
};

export default LoginPage;

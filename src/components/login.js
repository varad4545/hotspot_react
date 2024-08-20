import React, { useState } from "react";
import "../styles/login.css";
import axios from "axios";
import { Link } from "react-router-dom";
import Joi from "joi";
import icecream from '../images/ice-cream-login-page.png'
import graph from '../images/graph (1).png'

const backendPort = process.env.REACT_APP_BACKEND_PORT;
console.log("Backend Port:", backendPort);

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successState, setSuccessState] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const validateData = () => {
    const dataToValidate = { username, password };
    const { error } = schema.validate(dataToValidate);
    return error ? error.details[0].message : null;
  };

  const handleOnClick = async (e) => {
    e.preventDefault();
    const validationError = validateData();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:${backendPort}/login`,
        {
          username,
          password,
        }
      );
      if (response.status === 201) {
        localStorage.setItem("token", response.data.token);
        setSuccessState(true);
        setSuccessMessage("Login Successful");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.data) {
        setError(error.response.data);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();
    setPassword(event.target.value);
  };
  const handleUsernameChange = (event) => {
    event.preventDefault();
    setUsername(event.target.value);
  };

  return (
    <>
    <div className="login-page">
    <div className="login-main-container">
        {successState && (
          <div className="success-container-login">
            <span className="checkmark-login">&#x2713;</span>
            <p className="success-message-login">{successMessage}</p>
          </div>
        )}
        <div className="login-main-container">
        <div className="image-container">
        <img src={graph} alt="Graph" className="graph-image" />
        <img src={icecream} alt=""  className="ice-cream-image" 
  style={{ width: '400px', height: '500px' }}/>
  </div>

<div className="login-container">
<h1>HOTSPOT</h1>

  <h2>Login</h2>
  <div className="form">
    <input
      type="text"
      className="password"
      placeholder="Username"
      onChange={handleUsernameChange}
    ></input>
    <input
      type="password"
      className="password"
      placeholder="Password"
      onChange={handlePasswordChange}
    ></input>
    <div className="btn-container-login">
      <div className="btn-of-login">
      <button className="btn-login" onClick={handleOnClick}>
        Login
      </button>
      </div>
    <div className="forget-pass-link">
    <Link to="/reset-password" className="reset-text">
        Reset Password
      </Link>
    </div>
     
    </div>
    {error && <p className="error-message-login">{error}</p>}
  </div>
</div>
        </div>
      
      </div>
    </div>
   
    </>
  );
};

export default LoginPage;
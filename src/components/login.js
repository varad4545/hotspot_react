import React, { useState } from "react";
import "../styles/login.css";
import axios from "axios";
import { Link } from "react-router-dom";
import Joi from "joi";

const backendPort = process.env.REACT_APP_BACKEND_PORT;

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
      setError(error.response.data);
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
      <div className="login-main-container">
        {successState && (
          <div className="success-container-login">
            <span className="checkmark-login">&#x2713;</span>
            <p className="success-message-login">{successMessage}</p>
          </div>
        )}
        <div className="login-container">
          <h1>Login</h1>
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
              <button className="btn-login" onClick={handleOnClick}>
                {" "}
                Login
              </button>
              <Link to="/reset-password">
                <p className="reset-text">Reset Password</p>
              </Link>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

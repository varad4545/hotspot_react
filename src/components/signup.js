import React, { useState } from "react";
import "../styles/signup.css";
import axios from "axios";
import { Link } from "react-router-dom";
import Joi from "joi";

const backendPort = process.env.REACT_APP_BACKEND_PORT;

const SignupPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Admin");
  const [error, setError] = useState("");
  const [successStatus, setSuccessStatus] = useState(false);
  const [successMessage, setSuccessMessage ] = useState('');

  let currentToken = localStorage.getItem("token");

  const schema = Joi.object({
    username: Joi.string().min(4).required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match", 
      }),
    role: Joi.string().required(),
  });

  const validateData = () => {
    const dataToValidate = { username, password, confirmPassword, role };
    const { error } = schema.validate(dataToValidate);
    return error ? error.details[0].message : null;
  };

  const handleOnClick = async (e) => {
    try {
      e.preventDefault();
      const validationError = validateData();
      if (validationError) {
        setError(validationError);
        return;
      }
      const response = await axios.post(
        `http://localhost:${backendPort}/registerByAdmin`,
        {
          username,
          password,
          confirmPassword,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (response.status === 201) {
        setSuccessStatus(true);
        setSuccessMessage("Sucessfully registered the user");
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

  const handleConfirmPasswordChange = (event) => {
    event.preventDefault();
    setConfirmPassword(event.target.value);
  };

  const handleRoleChange = (event) => {
    event.preventDefault();
    setRole(event.target.value);
  };

  return (
    <>
      <div className="signup-main-container">
        <Link to="/" className="order-link">
          <div className="arrow-container-order">
            <span className="arrow-order">&#x2190;</span>
          </div>
        </Link>

        {successStatus && (
          <div className="success-container-signup">
            <span className="checkmark-signup">&#x2713;</span>
            <p className="success-message-signup">{successMessage}</p>
          </div>
        )}

        <div className="signup-container">
          <h1>SignUp</h1>
          <div className="form-signup">
            <input
              type="text"
              className="password-signup"
              placeholder="Username"
              onChange={handleUsernameChange}
            ></input>
            <input
              type="password"
              className="password-signup"
              placeholder="Password"
              onChange={handlePasswordChange}
            ></input>
            <input
              type="password"
              className="password-signup"
              placeholder="Confirm Password"
              onChange={handleConfirmPasswordChange}
            ></input>
            <select className="password-signup" onChange={handleRoleChange}>
              <option>Admin</option>
              <option>General</option>
            </select>
            <button
              type="submit"
              className="btn-signup"
              onClick={handleOnClick}
            >
              {" "}
              Signup
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;

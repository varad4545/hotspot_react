import React, { useState } from "react";
import "../styles/resetpassword.css";
import axios from "axios";
import Joi from "joi";

const backendPort = process.env.REACT_APP_BACKEND_PORT;

const ResetPasswordPage = () => {
  const [newpassword, setNewPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successState, setSuccessState] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  let currentToken = localStorage.getItem("token");

  // Joi schema for validation
  const schema = Joi.object({
    username: Joi.string().required(),
    newpassword: Joi.string().min(6).required(),
    confirmpassword: Joi.string()
      .valid(Joi.ref("newpassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match", // Custom error message for password mismatch
      }),
  });

  const validateData = () => {
    const dataToValidate = { username, newpassword, confirmpassword };
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
        `http://localhost:${backendPort}/reset-password`,
        {
          username,
          newpassword,
          confirmpassword,
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (response.status === 201) {
        setError("");
        setSuccessState(true);
        setSuccessMessage("Password reset successful");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response.data);
    }
  };

  const handleConfirmPasswordChange = (event) => {
    event.preventDefault();
    setConfirmPassword(event.target.value);
  };
  const handleNewPasswordChange = (event) => {
    event.preventDefault();
    setNewPassword(event.target.value);
  };

  const handleUsernameChange = (event) => {
    event.preventDefault();
    setUsername(event.target.value);
  };

  return (
    <>
      <div className="reset-main-container">
        {successState && (
          <div className="success-container-reset">
            <span className="checkmark-reset">&#x2713;</span>
            <p className="success-message-reset">{successMessage}</p>
          </div>
        )}
        <div className="reset-container">
          <h1>Reset Password</h1>
          <div className="form-reset">
            <input
              type="text"
              className="password"
              placeholder="Username"
              onChange={handleUsernameChange}
            ></input>
            <input
              type="password"
              className="password"
              placeholder="New Password"
              onChange={handleNewPasswordChange}
            ></input>
            <input
              type="password"
              className="password"
              placeholder="Confrirm Password"
              onChange={handleConfirmPasswordChange}
            ></input>
            <button className="btn-reset" onClick={handleOnClick}>
              {" "}
              Reset
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;

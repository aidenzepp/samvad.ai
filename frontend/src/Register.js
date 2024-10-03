import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Form validation function
  const validateForm = () => {
    if (username.length < 4) {
      setError("Username must be at least 4 characters long.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true); // Start loading

    // Send registration data to backend
    try {
      const response = await axios.post("http://127.0.0.1:5000/register", {
        username,
        password,
      });

      if (response.status === 200) {
        setSuccess("Registration successful! You can now log in.");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setError("");
        setLoading(false); // Stop loading

        setTimeout(() => {
          window.location.href = "/login"; // Redirect to login page
        }, 2000);
      }
    } catch (error) {
      setLoading(false); // Stop loading on error
      console.log("Error: ", error); // Log error details
      if (error.response) {
        switch (error.response.status) {
          case 409:
            setError("Username already exists. Please choose another.");
            break;
          case 500:
            setError("Internal server error. Please try again later.");
            break;
          default:
            setError("An error occurred. Please try again.");
        }
      } else {
        setError("An error occurred. Please check your network connection.");
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={error.includes("Username") ? "error" : ""}
            required
          />
        </div>
        <div className="form-group">
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={error.includes("Password") ? "error" : ""}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password: </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={error.includes("Passwords") ? "error" : ""}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
};

export default Register;

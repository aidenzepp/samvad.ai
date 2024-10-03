// src/Logout.js

import React from "react";
import axios from "axios";

const Logout = () => {
  const handleLogout = () => {
    axios
      .get("http://127.0.0.1:5000/logout")
      .then(() => {
        alert("Logged out successfully");
        window.location.href = "/login"; // Redirect to login after logout
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;

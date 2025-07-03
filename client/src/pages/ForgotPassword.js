// src/pages/ForgotPassword.js
import React, { useState } from "react";
import axios from "axios";
import MiniHeader from '../pages/MiniHeader'

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email,
      });

      setMessage({ type: "success", text: res.data.message || "Reset link sent!" });
      setEmail("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to send reset email",
      });
    }
  };

  return (
    <>
       <MiniHeader /> 
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">🔐 Forgot Password</h2>

        {message && (
          <div
            className={`mb-4 text-sm px-4 py-2 rounded ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;

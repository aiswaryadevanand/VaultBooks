
import React, { useState } from "react";
import axios from "axios";
import { Player } from "@lottiefiles/react-lottie-player";
import moneyAnim from "../assets/money.json";
import logo from "../assets/logo192.png";
import { useNavigate } from "react-router-dom";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

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
    <div className="flex h-screen">
      {/* Left Side */}
      <div className="w-1/2 flex flex-col justify-center bg-gray-100 px-10">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3 mb-6">
          <img src={logo} alt="VaultBooks Logo" className="w-10 h-10" />
          <h1 className="text-3xl font-extrabold tracking-wide text-blue-400">
            Vault<span className="text-gray-800">Books</span>
          </h1>
        </div>

        <h2 className="text-2xl font-bold mb-4"> Forgot Password</h2>

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
            className="w-full border p-3 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
          <p className="mt-6 text-sm">
  Remember your password?{" "}
  <span
    className="text-blue-600 cursor-pointer"
    onClick={() => navigate("/login")}
  >
    Back to Login
  </span>
</p>
        </form>
      </div>

      {/* Right Side (same as Login) */}
      <div className="w-1/2 flex flex-col items-center justify-start bg-gray-200 p-10">
        <Player autoplay loop src={moneyAnim} className="w-40 h-40 mb-6" />
        <img
          src="/Main-img.png"
          alt="VaultBooks Illustration"
          className="w-4/5 object-contain"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;

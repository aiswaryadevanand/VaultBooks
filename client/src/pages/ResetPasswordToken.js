// src/pages/ResetPasswordToken.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MiniHeader from '../pages/MiniHeader'

const ResetPasswordToken = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { newPassword }
      );
      setMessage({ type: 'success', text: res.data.message || 'Password updated!' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Invalid or expired link',
      });
    }
  };

  return (
    <>
    <MiniHeader/>
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">🔑 Reset Your Password</h2>

      {message && (
        <div
          className={`mb-4 text-sm px-4 py-2 rounded ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Update Password
        </button>
      </form>
    </div>
    </>
  );
};

export default ResetPasswordToken;

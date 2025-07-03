
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { Player } from '@lottiefiles/react-lottie-player';
import moneyAnim from '../assets/money.json';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, user, message } = res.data;
     

      localStorage.setItem('token', token);
      dispatch(setCredentials({ token, user }));
      setMessage(message || 'Login successful!');

      setTimeout(() => {
        navigate('/wallets-list',{replace:true});
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };
//   const token=useSelector((state)=> state.auth.token);
//   useEffect(() => {
//   if (window.location.pathname === "/login" && token) {
//     navigate('/wallets-list', { replace: true }); // 🚫 prevents back to login
//   }
// }, [token, navigate]);

  return (
    <div className="flex h-screen">
      {/* Left Side */}
      <div className="w-1/2 flex flex-col justify-center bg-gray-100 px-10">
        <h1 className="text-3xl font-bold mb-6">VaultBooks</h1>
        <h2 className="text-xl font-semibold mb-2">Welcome Back</h2>
        <p className="mb-6 text-gray-700">Please enter your details to log in.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full p-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-600 font-medium">{message}</p>
        )}

        <p className="mt-6">
          Don't have an account?{' '}
          <span
            className="text-blue-600 cursor-pointer "
            onClick={() => navigate('/register')}
          >
            Sign Up
          </span>
        </p>
        <p className="mt-4 text-sm text-blue-600 cursor-pointer " onClick={() => navigate("/forgot-password")}>
  Forgot Password?
</p>

      </div>
      

      {/* Right Side (Animation + Image) */}
      <div className="w-1/2 flex flex-col items-center justify-start bg-gray-200 p-10">
        <Player
          autoplay
          loop
          src={moneyAnim}
          className="w-40 h-40 mb-6"
        />
        <img
          src="/Main-img.png"
          alt="VaultBooks Illustration"
          className="w-4/5 object-contain"
        />
      </div>
    </div>
  );
}

export default Login;

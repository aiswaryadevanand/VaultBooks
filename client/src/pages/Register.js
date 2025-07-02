
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { Player } from '@lottiefiles/react-lottie-player';
import walletAnim from '../assets/wallet.json';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = loginRes.data;
      dispatch(setCredentials({ token, user }));

      setMessage('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex h-screen">

      {/* Left Side */}
      <div className="w-1/2 flex flex-col justify-center bg-gray-100 p-10">
        <h1 className="text-3xl font-bold mb-6">VaultBooks</h1>
        <h2 className="text-xl font-semibold mb-2">Create an Account</h2>
        <p className="text-gray-700 mb-8">Join us today by entering your details below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded"
          />
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
            minLength={8}
            className="w-full p-3 border border-gray-300 rounded"
          />

          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-700 transition"
          >
            Signup
          </button>
        </form>

        {message && <p className={`mt-4 ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}

        <p className="mt-6">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex flex-col items-center justify-start bg-gray-200 p-10 ">
        <Player
          autoplay
          loop
          src={walletAnim}
          className="w-36 h-36 mb-6"
        />
        <img
          src="/Main-img.png"
          alt="VaultBooks Illustration"
          className="w-4/5 h-auto object-contain mt-2"
        />
      </div>
    </div>
  );
};

export default Register;

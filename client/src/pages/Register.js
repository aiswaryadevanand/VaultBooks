import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { Player } from '@lottiefiles/react-lottie-player';
import walletAnim from '../assets/wallet.json';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from "../assets/logo192.png";


const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      return setMessage('Passwords do not match');
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
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
        <div className="flex items-center gap-3 mb-6">
  <img src={logo} alt="VaultBooks Logo" className="w-10 h-10" />
  <h1 className="text-3xl font-extrabold tracking-wide text-blue-400">
    Vault<span className="text-gray-800">Books</span>
  </h1>
</div>

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

          {/* Password Field with Eye Toggle */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              minLength={8}
              className="w-full p-3 border border-gray-300 rounded pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password Field with Eye Toggle */}
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-700 transition"
          >
            Signup
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.includes('match') || message.includes('failed')
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-sm">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-600 cursor-pointer "
          >
            Login
          </span>
        </p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex flex-col items-center justify-start bg-gray-200 p-10">
        <Player autoplay loop src={walletAnim} className="w-36 h-36 mb-6" />
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

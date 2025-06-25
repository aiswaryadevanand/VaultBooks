import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { Player } from '@lottiefiles/react-lottie-player';
import moneyAnim from '../assets/money.json';

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

      dispatch(setCredentials({ token, user }));
      setMessage(message || 'Login successful!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      
      {/* Left Side */}
      <div style={{
        width: '50%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>VaultBooks</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>Welcome Back</h2>
        <p style={{ marginBottom: '30px', color: '#333' }}>Please enter your details to log in.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
          />
          <button
            type="submit"
            style={{ width: '100%', padding: '10px', backgroundColor: '#333', color: '#fff', border: 'none' }}
          >
            Login
          </button>
        </form>

        <p style={{ marginTop: '15px', color: 'green' }}>{message}</p>

        <p style={{ marginTop: '20px' }}>
          Don't have an account?{' '}
          <span
            style={{ color: '#007bff', cursor: 'pointer' }}
            onClick={() => navigate('/register')}
          >
            Sign Up
          </span>
        </p>
      </div>

      {/* Right Side (Animation + Image) */}
      <div style={{
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start', // Align everything to the top
        backgroundColor: '#f0f0f0',
        padding: '50px',
      }}>
        <Player
          autoplay
          loop
          src={moneyAnim}
          style={{ height: '150px', width: '150px' }}
        />
        <img 
          src="/Main-img.png" 
          alt="VaultBooks Illustration"
          style={{ width: '80%', height: 'auto', objectFit: 'contain'}}
        />
      </div>
      
    </div>
  );
}

export default Login;

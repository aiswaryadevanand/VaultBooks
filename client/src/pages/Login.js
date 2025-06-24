
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');

  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', formData);

    console.log('✅ Login response:', res.data);

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('userRole', res.data.user.role);

    setMessage(res.data.message || 'Login successful!');
    
    // ⏳ Delay navigation so message can show
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
    
  } catch (err) {
    console.log('❌ Login error:', err.response?.data || err.message);
    setMessage(err.response?.data?.message || 'Login failed');
  }
};

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login;

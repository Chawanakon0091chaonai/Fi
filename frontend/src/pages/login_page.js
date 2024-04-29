import React, { useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = 'http://localhost:4000/login'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  

  const data_body = {
    email: email,
    pwd: pwd
}
  const handleSubmit = async(e) => {
    console.log(data_body)
    
    e.preventDefault();
    
  try {
    const response = await axios.post(apiUrl, data_body);
    const { accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
   
    window.location.href = '/main';

  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      if (error.response.status === 401) {
        setError('Incorrect email or password. Please try again.');
      } else if (error.response.status === 500) {
        setError('Internal server error. Please try again later.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } else {
      setError('Network error. Please check your internet connection.');
    }
  }
};
  return (
    <>
    <h1>Login</h1>
      <form onSubmit={handleSubmit}>    
        <label>Email</label>
        <input
          type="text"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br/>
        <label>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <br />
        <br/>
        <input type="submit" value="Submit" />
        <br/>
        <a href='/signup'>Signup</a>
      </form>
    </>
  );
};

export default Login;

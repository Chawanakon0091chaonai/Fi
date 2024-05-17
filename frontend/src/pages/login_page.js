import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'

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
   
    Swal.fire({
      position: 'mid',
      icon: 'success',
      title: 'Login succeeded',
      showConfirmButton: false,
      timer: 1000
    })
    setTimeout(() => {window.location.href = '/main';}, 1500);

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
    <div className="container-xl text-center">
    <div className="row mt-5 ">
      <div className="col-md-4"></div>
      <div className="col-md-4 border border-2 rounded">
      <h1 className='my-5'>Login</h1>
      <form onSubmit={handleSubmit} className='text-start' >    
        <label>Email</label>
        <input
          type="text"
          id="email"
          name="email"
          value={email}
          className="form-control"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br/>
        <label>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={pwd}
          className="form-control"
          onChange={(e) => setPwd(e.target.value)}
        />
        <br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div className="text-center"><input type="submit" value="Submit" className='btn btn-primary my-3 ' /></div>
      </form>
      
      <br/>
      <a href='/signup' className='mb-3'>Signup</a>
      <br/>
      <br/>
     
      </div>
    </div>
    </div>
    </>
  );
};

export default Login;

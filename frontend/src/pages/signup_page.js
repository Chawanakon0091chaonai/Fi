import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = 'http://localhost:4000/register'; 

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pwd, setPwd] = useState('');

  const data_body = {
    email: email,
    name: name,
    pwd: pwd
}
  const handleSubmit = async(e) => {
    e.preventDefault();
    window.location.href = '/login';
  
  try {
    const response = await axios.post(apiUrl, data_body);
    console.log(response.data); 
  
  } catch (error) {
    console.error('Error:', error);
    
  }
  }

  return (
    <>
    <div className="container-xl text-center">
      <div className="row">
        <div className="col"></div>
        <div className="col ">
        <h1 className='my-5'>Signup</h1>
      <form onSubmit={handleSubmit} class="text-start">
        <label>Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          class="form-control"
          onChange={(e) => setName(e.target.value)}
        />
        <br/>
        <label>Email</label>
        <input
          type="text"
          id="email"
          name="email"
          value={email}
          class="form-control"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br/>
        <label>Password</label>
        <input
          type="password"
          id="pwd"
          name="pwd"
          value={pwd}
          class="form-control"
          onChange={(e) => setPwd(e.target.value)}
        />
        <br/>
        <div className="col text-center"><input type="submit" value="Submit" class="btn btn-primary "/></div>
      </form>

      <div className="col my-3"><a class="my-5" href='/login'>Login</a></div>
        </div>
        <div className="col"></div>
      </div>
    </div>
    </>
  );
};

export default Register;

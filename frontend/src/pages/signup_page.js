import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'

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
  try {
    const response = await axios.post(apiUrl, data_body);
    if (email !== "" && name !== "" && pwd !== ""){
      Swal.fire({
        position: 'mid',
        icon: 'success',
        title: 'Signup succeeded',
        showConfirmButton: false,
        timer: 1000
      })
      setTimeout(() => {window.location.href = '/login';}, 1500);
      console.log(response.data); 
    }
    else{
      Swal.fire({
        icon: 'error',
        title: 'Signup failed.',
        text: 'Enter something',
      })
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Signup failed.',
      text: 'Password does not match',
    })
  }
  }

  return (
    <>
    <div className="container-xl text-center">
      <div className="row my-5">
        <div className="col"></div>
        <div className="col border border-2 rounded">
        <h1 className='my-5'>Signup</h1>
      <form onSubmit={handleSubmit} className="text-start">
        <label>Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          className="form-control"
          onChange={(e) => {
            const nameInput = e.target.value;
            const regex = /^[a-zA-Z0-9]*$/;

            if (regex.test(nameInput)) {
              setName(nameInput);
            } else {
              
              Swal.fire({
                title: "Warning",
                text: "Special characters are not allowed.",
                icon: "warning"
              });
            }
          }}
          required
        />
        <br/>
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
          id="pwd"
          name="pwd"
          value={pwd}
          className="form-control"
          onChange={(e) => setPwd(e.target.value)}
        />
        <br/>
        <div className="col text-center"><input type="submit" value="Submit" className="btn btn-primary "/></div>
      </form>

      <div className="col my-3"><a className="my-5" href='/login'>Login</a></div>
        </div>
        <div className="col"></div>
      </div>
    </div>
    </>
  );
};

export default Register;

import React, { useEffect, useState } from 'react';



const apiUrl = 'http://localhost:4000/contract'; 

const Notfound = () => {
  

  return (
    <>
      <div className="container text-center my-5">
        <div className="row pb-5"></div>
        <div className="row pb-5"></div>
        <div className="row pb-5"></div>
        <div className="row pb-5"></div>
        <div className="row pb-5"></div>
        <div className="row pb-5"></div>
        <div className="row pb-5"></div>
        <div className="row ">
        <div className="col-md-3"></div>
        <div className="col-md-6 border border-2 rounded py-5 px-2">
            <h1>404 Page not found</h1>
            <br/>
            <a className='btn btn-danger'  href="/main">Home</a>
            </div>
        </div>
      </div>
      </>
  );
};

export default Notfound;
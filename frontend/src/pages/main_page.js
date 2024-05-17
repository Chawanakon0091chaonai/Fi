import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'

const Main = () => {
    const [file, setFile] = useState({});
    const [image, setImage] = useState({});
    const token = localStorage.getItem('refreshToken');


    // Function to handle image selection
    const handleFileChange = async (e) => {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
    };

    // Submit
    const onSubmitPush = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (!file) {
            console.log("No file selected");
            return;
        }
        formData.append("file", file); // Set file name
        try {
            const result = await axios.post(
                "http://localhost:4000/filesupload",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );
            console.log("Upload successful", result.data);
        } catch (error) {
            console.error("Error uploading image", error);
        }
    };

    const handleLogout = async () => {
        try {
            // First, remove the refreshToken from localStorage
            localStorage.removeItem('refreshToken');
           
            // Then, send a DELETE request to the logout endpoint
            const result = await axios.delete(
                "http://localhost:4000/logout",
                {
                    data: { token: token }
                }
                
            );
            Swal.fire({
                position: 'mid',
                icon: 'success',
                title: 'Logout',
                showConfirmButton: false,
                timer: 1000
              })
              setTimeout(() => {window.location.href = '/login';}, 1500);
            // Redirect the user to the login page after successful logout
            
    
            // Optionally, you can log the result
            console.log("Logout successful", result.data);
        } catch (error) {
            // Handle errors, such as network issues or server errors
            console.error("Error logging out", error);
        }
    };
    
    
    
    return (
        <>
           <div className="container text-center">
                <div className="row">
                    <div className="col">
                    <h1 className="my-5">Upload to mongoDB</h1>
                    <a href="/compress">Compress Page</a>
                        <form onSubmit={onSubmitPush} className="my-5">
                            <input type="file" accept="" id="file" onChange={handleFileChange} />
                            <button type="submit" className="btn btn-success">Upload</button>
                        </form>
                        <button onClick={handleLogout} className="btn btn-primary">Logout</button>
                    </div>
                </div>
           </div>
        </>
    );
};

export default Main;

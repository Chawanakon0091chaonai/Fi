import React, { useState } from 'react';
import axios from 'axios';

const Main = () => {
    const [image, setImage] = useState(null);

    // Function to handle image selection
    const handleImageChange = async (e) => {
        const selectedFile = e.target.files[0];
        setImage(selectedFile);
    };

    // Submit
    const onSubmitPush = async (e) => {
        e.preventDefault();
        const formData = new FormData();
            formData.append("image", image); // Set file name
            try {
                const result = await axios.post(
                    "http://localhost:4000/imagesupload",
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" }
                    }
                );
                console.log("Upload successful", result.data);
            } catch (error) {
                console.error("Error uploading image", error);
            }
        }
    

    return (
        <>
            <h1>Main Page</h1>
            <form onSubmit={onSubmitPush}>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <br/><br/>
                <button type="submit">Upload</button>
            </form>
        </>
    );
};

export default Main;
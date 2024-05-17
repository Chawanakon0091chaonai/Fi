import AWS from "aws-sdk";
import { useState } from "react";
import Swal from 'sweetalert2'
function App() {
  // Create state to store file and upload progress
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Function to upload file to S3 in chunks with concurrency control
  const uploadFileInChunks = async () => {
    // S3 Bucket Name
    const S3_BUCKET = "multimedia-upload-bucket";

    // S3 Region
    const REGION = "us-east-1";

    // S3 Credentials
    AWS.config.update({
      
    });

    // Initialize S3 instance
    const s3 = new AWS.S3({
      params: { Bucket: S3_BUCKET },
      region: REGION,
    });

    // Chunk size (in bytes)
    const CHUNK_SIZE = (file.size / 4); // 255KB

    // Calculate total number of chunks
    const numChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Concurrency control: Limit the number of concurrent uploads
    const MAX_CONCURRENT_UPLOADS = numChunks; // Adjust as needed
    const semaphore = new Semaphore(MAX_CONCURRENT_UPLOADS);

    try {
      // Array to store promises for each chunk upload
      const uploadPromises = [];

      // Upload each chunk
      for (let i = 0; i < numChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Parameters for uploading chunk
        const params = {
          Bucket: S3_BUCKET,
          Key: `${file.name.slice(0, file.name.lastIndexOf('.'))}-part-${i}.${file.name.split('.').pop()}`,
          Body: chunk,
        };

        // Acquire semaphore permit before uploading
        await semaphore.acquire();

        // Push promise for chunk upload into array
        uploadPromises.push(
          s3.upload(params).promise().finally(() => semaphore.release())
        );
      }

      // Execute all chunk upload promises in parallel
      await Promise.all(uploadPromises);
      
      // Update upload progress
      setUploadProgress(100);
      
      // File successfully uploaded
      Swal.fire({
        position: 'mid',
        icon: 'success',
        title: 'File uploaded successfully.',
        showConfirmButton: false,
        timer: 1000
      })
    } catch (error) {
      Swal.fire({
        position: 'mid',
        icon: 'error',
        title: 'Error uploading chunks:' + error.message,
        showConfirmButton: false,
        timer: 1000
      })
    } finally {
      // Reset upload progress
      setUploadProgress(0);
    }
  };

  // Function to handle file and store it to file state
  const handleFileChange = (e) => {
    // Uploaded file
    const file = e.target.files[0];
    // Changing file state
    setFile(file);
  };

  return (
    <>
    <div className="container my-5 py-5 border rounded">
      <div className="row">
        <div className="col">
        <div className="App">
          <div>
            <h1>Upload to Aws S3</h1>
            <p><br/></p>
            <input type="file" onChange={handleFileChange} />
            <button onClick={uploadFileInChunks} className="btn btn-primary">Upload</button>
            {/* Display upload progress */}
            {uploadProgress > 0 && <p>Uploading: {uploadProgress}%</p>}
          </div>
        </div>          
        </div>
      </div>
    </div>
    
    </>
  );
}

export default App;

// Semaphore implementation for concurrency control
class Semaphore {
  constructor(initialCount) {
    this.count = initialCount;
    this.waiting = [];
  }

  async acquire() {
    if (this.count > 0) {
      this.count--;
      return;
    }
    await new Promise(resolve => this.waiting.push(resolve));
  }

  release() {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      resolve();
    } else {
      this.count++;
    }
  }
}

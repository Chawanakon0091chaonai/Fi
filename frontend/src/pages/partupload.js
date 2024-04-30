import AWS from "aws-sdk";
import { useState } from "react";

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
      accessKeyId: "",
      secretAccessKey: "",
    });

    // Initialize S3 instance
    const s3 = new AWS.S3({
      params: { Bucket: S3_BUCKET },
      region: REGION,
    });

    // Chunk size (in bytes)
    const CHUNK_SIZE = 1019 * 103 * 50; // 255KB

    // Calculate total number of chunks
    const numChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Concurrency control: Limit the number of concurrent uploads
    const MAX_CONCURRENT_UPLOADS = 5; // Adjust as needed
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
      alert("File uploaded successfully.");
    } catch (error) {
      console.error("Error uploading chunks:", error);
      alert("Error uploading chunks: " + error.message);
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
    <div className="App">
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={uploadFileInChunks}>Upload</button>
        {/* Display upload progress */}
        {uploadProgress > 0 && <p>Uploading: {uploadProgress}%</p>}
      </div>
    </div>
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

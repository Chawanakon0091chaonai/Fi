import React, { useState } from "react";

function rleCompress(data) {
    let compressed = '';
    let count = 1;
    for (let i = 1; i < data.length; i++) {
        if (data[i] === data[i - 1]) {
            count++;
        } else {
            compressed += count + data[i - 1];
            count = 1;
        }
    }
    compressed += count + data[data.length - 1]; // Append last run
    return compressed;
}



const Main = () => {
    const [file, setFile] = useState(null);
    const [compressedFile, setCompressedFile] = useState(null);
    const [compressedFileUrl, setCompressedFileUrl] = useState(null);

    const getFile = (event) => {
        const selectedFile = event.target.files[0];
        
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (file) {
            const fileType = file.name.split('.').pop().toLowerCase();
    
            if (['png', 'jpg', 'jpeg'].includes(fileType)) {
                compressImage(file);
            } else if (['mp4', 'h264'].includes(fileType)) {
                compressVideo(file)
                    .then((compressedVideoUrl) => {
                        setCompressedFileUrl(compressedVideoUrl);
                    })
                    .catch((error) => {
                        console.error('Error compressing video:', error);
                        alert('Error compressing video. Please try again.');
                    });
            } else if (['mp3', 'wav'].includes(fileType)) {
                compressAudio(file)
                    .then((compressedAudioUrl) => {
                        setCompressedFileUrl(compressedAudioUrl);
                    })
                    .catch((error) => {
                        console.error('Error compressing audio:', error);
                        alert('Error compressing audio. Please try again.');
                    });
            } else if (fileType === 'pdf') {
                compressPDF(file);
            } else {
                alert('Unsupported file type.');
            }
        }
    };
       

    const compressImage = (selectedFile) => {
        const img = new Image();
        img.src = URL.createObjectURL(selectedFile);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            const MAX_HEIGHT = 1000;
            let width = img.width;
            let height = img.height;
    
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
    
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setCompressedFileUrl(dataUrl); 
        };
    };

    const compressVideo = (selectedFile) => {
        return new Promise((resolve, reject) => {
            const videoElement = document.createElement('video');
            videoElement.src = URL.createObjectURL(selectedFile);
    
            const clockElement = document.createElement('div');
            document.body.appendChild(clockElement);
    
            let startTime = Date.now();
            let timerId;
    
            videoElement.onloadedmetadata = () => {
                const targetWidth = 1280;
                const targetHeight = 720;
                const targetFrameRate = 24; 
    
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
    
                canvas.width = targetWidth;
                canvas.height = targetHeight;
    
                const mimeType = 'video/webm; codecs=h264';
                const videoStream = canvas.captureStream(targetFrameRate);
    
                let audioStream = null;
                if (videoElement.captureStream && videoElement.captureStream().getAudioTracks().length > 0) {
                    audioStream = videoElement.captureStream().getAudioTracks()[0];
                }
    
                let combinedStream;
                if (audioStream) {
                    combinedStream = new MediaStream([...videoStream.getTracks(), audioStream]);
                } else {
                    combinedStream = videoStream;
                }
    
                const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
    
                let compressedDataUrls = [];
    
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        const dataUrl = URL.createObjectURL(event.data);
                        compressedDataUrls.push(dataUrl);
                    }
                };
    
                mediaRecorder.onstop = () => {
                    clearTimeout(timerId);
                    resolve(compressedDataUrls);
                };
    
                mediaRecorder.start();
    
                const drawFrame = () => {
                    context.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
                    const elapsedTime = (Date.now() - startTime) / 1000;
                    clockElement.innerText = `Compressing Time: ${elapsedTime.toFixed(2)} seconds`;
                    timerId = setTimeout(drawFrame, 1000 / targetFrameRate); 
                };
    
                drawFrame();
    
                setTimeout(() => {
                    mediaRecorder.stop();
                }, videoElement.duration * 1000);
    
                videoElement.play();
            };
    
            videoElement.onerror = (error) => {
                reject(error);
            };
        });
    }; 
    
    const compressAudio = (selectedFile) => {
        return new Promise((resolve, reject) => {
            const audioContext = new AudioContext();
            const reader = new FileReader();
    
            // Display clock
            const clockElement = document.createElement('div');
            document.body.appendChild(clockElement);
    
            let startTime = Date.now(); // Record start time
    
            reader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
    
                    const gainNode = audioContext.createGain();
                    source.connect(gainNode);
                    gainNode.connect(audioContext.destination);
    
                    const mediaStreamDestination = audioContext.createMediaStreamDestination();
                    gainNode.connect(mediaStreamDestination);
    
                    const mimeType = 'audio/webm; codecs=opus';
                    const options = { mimeType, audioBitsPerSecond: 64000 };
    
                    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, options);
                    let chunks = [];
    
                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            chunks.push(event.data);
                        }
                    };
    
                    mediaRecorder.onstop = () => {
                        const blob = new Blob(chunks, { type: mimeType });
                        const url = URL.createObjectURL(blob);
                        resolve(url);
                    };
    
                    mediaRecorder.start();
                    source.start(0);
    
                    const drawClock = () => {
                        const elapsedTime = (Date.now() - startTime) / 1000; // Calculate elapsed time in seconds
                        clockElement.innerText = `Compressing Time: ${elapsedTime.toFixed(2)} seconds`;
                        if (mediaRecorder.state === 'recording') {
                            requestAnimationFrame(drawClock);
                        }
                    };
    
                    drawClock();
    
                    setTimeout(() => {
                        mediaRecorder.stop();
                        audioContext.close();
                    }, audioBuffer.duration * 1000 + 1000);  // ensure recording covers the full audio plus a buffer
                } catch (error) {
                    reject(error);
                }
            };
    
            reader.onerror = reject;
            reader.readAsArrayBuffer(selectedFile);
        });
    };
    

    function compressPDF(selectedFile) {
        const reader = new FileReader();
    
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            let binaryString = '';
            for (let i = 0; i < data.length; i++) {
                binaryString += String.fromCharCode(data[i]);
            }
            const compressedString = rleCompress(binaryString);
            const encoder = new TextEncoder();
            const compressedData = encoder.encode(compressedString); // Convert string back to Uint8Array
            const compressedBlob = new Blob([compressedData], { type: 'application/pdf' });
            setCompressedFileUrl(URL.createObjectURL(compressedBlob));
        };
    
        reader.readAsArrayBuffer(selectedFile);
    }

    const handleDownload = () => {
        if (compressedFileUrl) {
            const downloadLink = document.createElement('a');
            downloadLink.href = compressedFileUrl;
            downloadLink.download = file ? `compressed_${file.name}` : 'compressed_file';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };
    


    return (
        <>
            <div className="container text-center">
                <h1>Compress</h1>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                    <a href="/main">Back</a>
                    </div>
                    <label>Upload</label>
                    <input type='file' onChange={getFile} />
                    <br /><br />
                    <input type="submit" value="Compress" />
                </form>
                {compressedFileUrl && (
                    <>
                        <h2>Compressed File Preview</h2>
                        {file && file.name && ( 
                            file.name.split('.').pop().toLowerCase() === 'mp4' || 
                            file.name.split('.').pop().toLowerCase() === 'h264' ? (
                                <video width="300" controls>
                                    <source src={compressedFileUrl} type={file.type} />
                                    Your browser does not support the video tag.
                                </video>
                            ) : file.name.split('.').pop().toLowerCase() === 'png' || 
                                file.name.split('.').pop().toLowerCase() === 'jpeg' || 
                                file.name.split('.').pop().toLowerCase() === 'jpg' ? (
                                <img src={compressedFileUrl} alt="Compressed Img" />
                            ) : file.name.split('.').pop().toLowerCase() === 'pdf'  ? (
                                <object data={compressedFileUrl} type="application/pdf" width="100%" height="500px">
                                    <p>PDF preview is not available.</p>
                                </object>
                            ) : (
                                <audio controls>
                                    <source src={compressedFileUrl} type={file.type} />
                                    Your browser does not support the audio element.
                                </audio>
                            )
                        )}
                        <br /><br />
                        <button onClick={handleDownload}>Download Compressed File</button>
                    </>
                )}
            </div>
        </>
    );
};

export default Main;
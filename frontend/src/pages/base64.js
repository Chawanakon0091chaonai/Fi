import React from 'react';

class FileBase64Converter extends React.Component {
  handleFileInputChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const base64String = event.target.result;
      this.downloadTxtFile(base64String);
    };

    reader.readAsDataURL(file);
  };

  

  downloadTxtFile = (base64String) => {
    const element = document.createElement('a');
    const file = new Blob([base64String], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'base64_output.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  
  render() {
    return (
      <>
      
      <div>
      <h1>Base 64</h1>
      <a href="/part">to cloud upload</a>
      <p></p>
        <input type="file" onChange={this.handleFileInputChange} />
      </div>
      </>
    );
  }
}

export default FileBase64Converter;

"use client"
"use client";
import { useState } from 'react';

const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [nftName, setNftName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [folderName, setFolderName] = useState('');

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (files.length === 0 || !nftName || !description) {
      setMessage('Please provide NFT name, description, and select files.');
      return;
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    formData.append('nftName', nftName);
    formData.append('description', description);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    setMessage(result.message);
    setFolderName(result.folderName); // Store the folder name
  };

  const handleDownload = () => {
    if (!folderName) {
      alert('Please upload a folder first.');
      return;
    }
    
    // Trigger the download
    window.open(`/api/download?folderName=${folderName}`, '_blank');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Upload NFT Folder</h2>
      <input
        type="text"
        placeholder="NFT Name"
        value={nftName}
        onChange={(e) => setNftName(e.target.value)}
        style={{ marginBottom: '10px', width: '100%', color: 'black' }} // Set text color to black
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ marginBottom: '10px', width: '100%', color: 'black' }} // Set text color to black
      />
      <input
        type="file"
        multiple
        webkitdirectory="true"
        onChange={handleFileChange}
        style={{ marginBottom: '10px' }}
      />
      <button onClick={handleUpload} style={{ marginTop: '10px' }}>
        Upload Folder
      </button>
      {message && (
        <div>
          <p>{message}</p>
          {folderName && (
            <div>
              <p>Uploaded Folder: {folderName}</p>
              <button onClick={handleDownload} style={{ marginTop: '10px' }}>
                Download Folder
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;

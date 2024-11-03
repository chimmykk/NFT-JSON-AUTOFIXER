"use client";
import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const JsonAutoFixer = () => {
  const [startTokenId, setStartTokenId] = useState(''); // Set initial state to empty string
  const [numberOfImages, setNumberOfImages] = useState(''); // Set initial state to empty string
  const [nftName, setNftName] = useState('');
  const [description, setDescription] = useState('');
  const [jsonFiles, setJsonFiles] = useState([]);

  const handleGenerateJson = () => {
    const startId = parseInt(startTokenId);
    const numImages = parseInt(numberOfImages);

    if (!nftName || !description || numImages <= 0 || isNaN(startId)) {
      alert('Please provide NFT name, description, and valid numeric values for start token ID and number of images.');
      return;
    }

    const generatedJsonFiles = [];

    for (let i = 0; i < numImages; i++) {
      const jsonData = {
        tokenId: startId + i,
        name: `${nftName} #${startId + i}`,
        image: `${startId + i}.png`,
        attributes: [],
        description: description,
      };

      generatedJsonFiles.push({
        fileName: `${startId + i}.json`,
        data: jsonData,
      });
    }

    setJsonFiles(generatedJsonFiles);
    alert('JSON files generated successfully!');
  };

  const handleDownloadJson = () => {
    if (jsonFiles.length === 0) {
      alert('No JSON files to download.');
      return;
    }

    const zip = new JSZip();

    jsonFiles.forEach(({ fileName, data }) => {
      zip.file(`jsonfolder/${fileName}`, JSON.stringify(data, null, 2));
    });

    zip.generateAsync({ type: 'blob' })
      .then((content) => {
        saveAs(content, 'jsonfolder.zip');
      });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Generate JSON Files</h2>
      <input
        type="text"
        placeholder="NFT Name"
        value={nftName}
        onChange={(e) => setNftName(e.target.value)}
        style={{ marginBottom: '10px', width: '100%', color: 'black' }}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ marginBottom: '10px', width: '100%', color: 'black' }}
      />
      <input
        type="number"
        placeholder="Start Token ID (e.g., 0)"
        value={startTokenId}
        onChange={(e) => setStartTokenId(e.target.value)} // Keep as string for controlled input
        style={{ marginBottom: '10px', width: '100%', color: 'black' }}
      />
      <input
        type="number"
        placeholder="Number of Images (e.g., 5)"
        value={numberOfImages}
        onChange={(e) => setNumberOfImages(e.target.value)} // Keep as string for controlled input
        style={{ marginBottom: '10px', width: '100%', color: 'black' }}
      />
      <button onClick={handleGenerateJson} style={{ marginTop: '10px' }}>
        Generate JSON
      </button>
      <br />
      <button onClick={handleDownloadJson} style={{ marginTop: '10px' }}>
        Download JSON as ZIP
      </button>
    </div>
  );
};

export default JsonAutoFixer;

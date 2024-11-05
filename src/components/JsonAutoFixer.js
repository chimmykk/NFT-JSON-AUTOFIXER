"use client";
import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const JsonAutoFixer = () => {
  const [startTokenId, setStartTokenId] = useState(''); 
  const [numberOfImages, setNumberOfImages] = useState(''); 
  const [nftName, setNftName] = useState('');
  const [description, setDescription] = useState('');
  const [jsonFiles, setJsonFiles] = useState([]);
  const [attributes, setAttributes] = useState([{ trait_type: '', value: '' }]);
  const [uploadedJson, setUploadedJson] = useState(null);

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
        attributes: attributes.filter(attr => attr.trait_type && attr.value),
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

  const handleUploadJson = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert('Please upload a JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = JSON.parse(e.target.result);

        if (Array.isArray(jsonContent)) {
          const generatedJsonFiles = jsonContent.map((data, index) => ({
            fileName: `${index}.json`,
            data: {
              ...data,
              name: data.name || `${nftName} #${index}`,
              description: data.description || description,
              attributes: data.attributes && Array.isArray(data.attributes) 
                ? data.attributes 
                : attributes,
            },
          }));
          
          setJsonFiles(generatedJsonFiles);
          alert('JSON files generated from uploaded array successfully!');
        } else {
          alert('Uploaded JSON file is not an array.');
        }
      } catch (error) {
        alert('Error parsing JSON file: ' + error.message);
      }
    };
    reader.readAsText(file);
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

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][field] = value;
    setAttributes(updatedAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  const removeAttribute = (index) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
  };

  return (
    <div style={{ display: 'flex', padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#f8f8f8', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ flex: 1, paddingRight: '20px' }}>
        <h2 style={{ textAlign: 'center' }}>Generate JSON Files</h2>
        <input
          type="text"
          placeholder="NFT Name"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#000', color: '#fff' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#000', color: '#fff' }}
        />
        <input
          type="number"
          placeholder="Start Token ID (e.g., 0)"
          value={startTokenId}
          onChange={(e) => setStartTokenId(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#000', color: '#fff' }}
        />
        <input
          type="number"
          placeholder="Number of Images (e.g., 5)"
          value={numberOfImages}
          onChange={(e) => setNumberOfImages(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#000', color: '#fff' }}
        />

        <h3 style={{ marginTop: '20px' }}>Attributes</h3>
        {attributes.map((attr, index) => (
          <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Trait Type"
              value={attr.trait_type}
              onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
              style={{ marginRight: '10px', flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#000', color: '#fff' }}
            />
            <input
              type="text"
              placeholder="Value"
              value={attr.value}
              onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
              style={{ marginRight: '10px', flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#000', color: '#fff' }}
            />
            <button onClick={() => removeAttribute(index)} style={{ padding: '10px', borderRadius: '4px', background: '#ff4d4d', color: '#fff', border: 'none' }}>
              Remove
            </button>
          </div>
        ))}
        <button onClick={addAttribute} style={{ marginBottom: '20px', background: '#007bff', color: '#fff', padding: '10px', borderRadius: '4px', border: 'none' }}>
          Add Attribute
        </button>

        <button onClick={handleGenerateJson} style={{ marginTop: '10px', background: '#28a745', color: '#fff', padding: '10px', borderRadius: '4px', border: 'none' }}>
          Generate JSON
        </button>

        {/* Upload JSON Button */}
        <input 
          type="file" 
          accept=".json" 
          onChange={handleUploadJson}
          style={{ marginTop: '20px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#000', color: '#fff' }}
        />
        
        <br />
        <button onClick={handleDownloadJson} style={{ marginTop: '10px', background: '#17a2b8', color: '#fff', padding: '10px', borderRadius: '4px', border: 'none' }}>
          Download JSON as ZIP
        </button>
      </div>

      <div style={{ flex: 1, paddingLeft: '20px', background: '#f0f0f0', borderRadius: '8px', padding: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ textAlign: 'center' }}>Generated JSON Files</h3>
        <ul>
          {jsonFiles.map(({ fileName }, index) => (
            <li key={index}>{fileName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JsonAutoFixer;

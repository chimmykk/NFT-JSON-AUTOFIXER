import multer from 'multer';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const handler = async (req, res) => {
  upload.array('files')(req, res, async (err) => {
    if (err) return res.status(500).json({ message: 'File upload failed' });

    try {
      const jsonFiles = [];
      const imageFiles = {};
      const timestamp = Date.now().toString();
      const rootFolder = path.join(process.cwd(), 'uploads', timestamp);
      const jsonFolder = path.join(rootFolder, 'metadata'); // Subfolder for JSON files
      const imageFolder = path.join(rootFolder, 'images'); // Subfolder for images
      const nftName = req.body.nftName; // Get the NFT name from the form data
      const description = req.body.description; // Get the description from the form data

      // Create a root folder for this upload and subfolders for JSON and images
      fs.mkdirSync(rootFolder, { recursive: true });
      fs.mkdirSync(jsonFolder, { recursive: true });
      fs.mkdirSync(imageFolder, { recursive: true });

      // Sort JSON and image files
      req.files.forEach((file) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.json') {
          jsonFiles.push(file);
        } else if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
          imageFiles[file.originalname] = file;
        }
      });

      const results = [];
      
      // Process each JSON file
      for (let i = 0; i < jsonFiles.length; i++) {
        const jsonFile = jsonFiles[i];
        const jsonData = JSON.parse(jsonFile.buffer.toString());

        // Update the name and description in the JSON
        jsonData.name = `${nftName} #${i}`; // Corrected name format
        jsonData.description = description; // User-provided description
        jsonData.attributes = []; // Remove all traits

        // Rename images to match index
        const imageFileName = `${i}.png`;
        const imageFile = imageFiles[imageFileName];

        if (imageFile) {
          const outputPath = path.join(imageFolder, imageFileName);

          // Save image to the new uploads folder
          fs.writeFileSync(outputPath, imageFile.buffer);

          jsonData.image = imageFileName; // Only store the image filename
        } else {
          jsonData.image = 'default.png'; // Use a default filename if no image is found
        }

        // Set the token ID to the current index
        jsonData.tokenId = i; // Set tokenId to the index

        // Save the updated JSON file
        const jsonFileName = `${i}.json`; // Save JSON files as 0.json, 1.json, etc.
        const jsonOutputPath = path.join(jsonFolder, jsonFileName);
        fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonData, null, 2));

        results.push({ jsonFileName, imagePath: jsonData.image });
      }

      res.status(200).json({
        message: 'Folder uploaded and JSON files processed successfully.',
        folderName: timestamp, // Include the folder name in the response
        files: results,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error processing files', error: error.message });
    }
  });
};

export default handler;

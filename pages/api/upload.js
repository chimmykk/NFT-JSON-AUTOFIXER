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

const MAX_BATCH_SIZE = 4 * 1024 * 1024; // 4MB limit for each batch

const handler = async (req, res) => {
  upload.array('files')(req, res, async (err) => {
    if (err) return res.status(500).json({ message: 'File upload failed' });

    try {
      const jsonFiles = [];
      const imageFiles = {};
      const timestamp = Date.now().toString();
      const rootFolder = path.join(process.cwd(), 'uploads', timestamp);
      const jsonFolder = path.join(rootFolder, 'metadata');
      const imageFolder = path.join(rootFolder, 'images');
      const nftName = req.body.nftName;
      const description = req.body.description;

      // Create the necessary directories
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
      let currentBatch = [];
      let currentBatchSize = 0;

      // Create batches based on file sizes
      for (const jsonFile of jsonFiles) {
        const fileSize = jsonFile.size;

        // Check if adding the current file exceeds the batch size
        if (currentBatchSize + fileSize > MAX_BATCH_SIZE) {
          // Process the current batch before adding the new file
          await processBatch(currentBatch, imageFiles, nftName, description, jsonFolder, imageFolder, results);
          currentBatch = []; // Reset current batch
          currentBatchSize = 0; // Reset size
        }

        // Add the file to the current batch
        currentBatch.push(jsonFile);
        currentBatchSize += fileSize;
      }

      // Process any remaining files in the last batch
      if (currentBatch.length > 0) {
        await processBatch(currentBatch, imageFiles, nftName, description, jsonFolder, imageFolder, results);
      }

      res.status(200).json({
        message: 'Folders uploaded and JSON files processed successfully.',
        folderName: timestamp,
        files: results,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error processing files', error: error.message });
    }
  });
};

// Function to process each batch
const processBatch = async (batch, imageFiles, nftName, description, jsonFolder, imageFolder, results) => {
  for (let i = 0; i < batch.length; i++) {
    const jsonFile = batch[i];
    const jsonData = JSON.parse(jsonFile.buffer.toString());

    // Update the name and description in the JSON
    jsonData.name = `${nftName} #${i}`;
    jsonData.description = description;
    jsonData.attributes = [];

    // Rename images to match index
    const imageFileName = `${i}.png`;
    const imageFile = imageFiles[imageFileName];

    if (imageFile) {
      const outputPath = path.join(imageFolder, imageFileName);
      fs.writeFileSync(outputPath, imageFile.buffer);
      jsonData.image = imageFileName; // Only store the image filename
    } else {
      jsonData.image = 'default.png'; // Use a default filename if no image is found
    }

    // Set the token ID to the current index
    jsonData.tokenId = i;

    // Save the updated JSON file
    const jsonFileName = `${i}.json`;
    const jsonOutputPath = path.join(jsonFolder, jsonFileName);
    fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonData, null, 2));

    results.push({ jsonFileName, imagePath: jsonData.image });
  }
};

export default handler;

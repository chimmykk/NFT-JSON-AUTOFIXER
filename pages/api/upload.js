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

const MAX_BATCH_SIZE = 3 * 1024 * 1024; // Maximum batch size of 3MB

const handler = async (req, res) => {
  upload.array('files')(req, res, async (err) => {
    if (err) return res.status(500).json({ message: 'File upload failed', error: err.message });

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
      const batches = []; // To store batches of files
      let currentBatch = [];
      let currentBatchSize = 0;

      // Create batches based on file sizes
      for (const file of jsonFiles) {
        currentBatch.push(file);
        currentBatchSize += file.size;

        if (currentBatchSize >= MAX_BATCH_SIZE) {
          batches.push(currentBatch);
          currentBatch = [];
          currentBatchSize = 0;
        }
      }
      if (currentBatch.length > 0) {
        batches.push(currentBatch); // Push the last batch if it exists
      }

      // Process each batch
      for (const batch of batches) {
        for (let i = 0; i < batch.length; i++) {
          const jsonFile = batch[i];
          const jsonData = JSON.parse(jsonFile.buffer.toString());

          // Update JSON fields
          jsonData.name = `${nftName} #${i}`;
          jsonData.description = description;
          jsonData.attributes = [];

          // Handle image file renaming
          const imageFileName = `${i}.png`;
          const imageFile = imageFiles[imageFileName];

          if (imageFile) {
            const outputPath = path.join(imageFolder, imageFileName);
            fs.writeFileSync(outputPath, imageFile.buffer);
            jsonData.image = imageFileName;
          } else {
            jsonData.image = 'default.png';
          }

          jsonData.tokenId = i;
          const jsonFileName = `${i}.json`;
          const jsonOutputPath = path.join(jsonFolder, jsonFileName);
          fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonData, null, 2));

          results.push({ jsonFileName, imagePath: jsonData.image });
        }
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

export default handler;

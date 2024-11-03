import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const handler = (req, res) => {
  const { folderName } = req.query; // Get the folder name from the query string
  const folderPath = path.join(process.cwd(), 'uploads', folderName);

  // Check if the folder exists
  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ message: 'Folder not found' });
  }

  // Set headers for the ZIP file download
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=${folderName}.zip`);

  // Create a ZIP archive
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res); // Pipe the archive to the response

  // Append files from the folder
  archive.directory(folderPath, false);
  archive.finalize(); // Finalize the archive

  // Handle errors
  archive.on('error', (err) => {
    res.status(500).json({ message: 'Error creating ZIP file', error: err.message });
  });

  // Once the archive has finished sending, delete the folder
  archive.on('finish', () => {
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error('Error deleting folder:', err);
      } else {
        console.log(`Folder ${folderName} deleted successfully`);
      }
    });
  });
};

export default handler;

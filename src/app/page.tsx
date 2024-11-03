import FileUploader from '../components/Fileuploader';
import JsonAutoFixer from '../components/JsonAutoFixer'; // Import the new component

export default function Home() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>NFT JSON AutoFixer</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        Upload your folder containing JSON files and images.
      </p>
      <FileUploader />
      <JsonAutoFixer /> {/* Include the new component here */}
      <footer style={{ marginTop: '50px', fontSize: '0.9rem', color: '#777' }}>
        <p>&copy; {new Date().getFullYear()} MintPad. All rights reserved.</p>
      </footer>
    </div>
  );
}

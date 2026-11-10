import { useState } from 'react';

function AudioUploader() {
  const [file, setFile] = useState(null);
  const [audioName, setAudioName] = useState('');
  const [uploadStatus, setUploadStatus] = useState(''); // 'uploading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    // Grab the first file the user selected
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault(); // Prevent page refresh
    
    if (!file) {
      setMessage("Please select an audio file first.");
      return;
    }

    setUploadStatus('uploading');
    setMessage('Uploading...');

    // 1. Initialize FormData (Required for sending files)
    const formData = new FormData();
    
    // 2. Append text fields FIRST
    // The key 'audioName' matches what we look for in req.body.audioName on the backend
    formData.append('audioName', audioName || file.name); 
    
    // 3. Append the file SECOND
    // The key 'audioData' MUST match upload.single('audioData') on the backend
    formData.append('audioData', file);

    try {
      // Send the request to your backend route
      const response = await fetch('/api/audio', {
        method: 'POST',
        body: formData, 
        // Note: Do NOT manually set the 'Content-Type' header here. 
        // The browser automatically sets it to 'multipart/form-data' with the correct boundary.
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setMessage(`Success! Audio saved. (ID: ${data.audioDocument?.gridFsId || data.fileId})`);
        
        // Clear the form
        setFile(null);
        setAudioName('');
        // Reset the file input visually
        document.getElementById('audioFileInput').value = ''; 
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      setUploadStatus('error');
      setMessage(error.message);
    }
  };

return (
    <div className="border border-gray-300 p-5 rounded-lg max-w-100">
      <h3 className="text-lg font-medium mb-4">Upload Island Audio</h3>
      
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        
        {/* Custom Name Input */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Audio Name:</label>
          <input 
            type="text" 
            value={audioName}
            onChange={(e) => setAudioName(e.target.value)}
            placeholder="e.g., Main Theme"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* File Input */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Select File:</label>
          <input 
            id="audioFileInput"
            type="file" 
            accept="audio/*" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={uploadStatus === 'uploading' || !file}
          className="p-2.5 mt-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Audio'}
        </button>

      </form>

      {/* Status Message */}
      {message && (
        <p className={`mt-4 text-sm font-medium ${
          uploadStatus === 'error' ? 'text-red-600' : 
          uploadStatus === 'success' ? 'text-green-600' : 
          'text-gray-900'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default AudioUploader;
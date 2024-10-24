import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [contentImage, setContentImage] = useState(null);
  const [styleImage, setStyleImage] = useState(null);
  const [stylizedImage, setStylizedImage] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const [showPoppers, setShowPoppers] = useState(false); // State to control poppers visibility

  const handleUpload = (event, setImage) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('content_image', contentImage);
    formData.append('style_image', styleImage);

    setLoading(true); // Start loading

    try {
      const response = await axios.post('http://localhost:5000/stylize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStylizedImage(`data:image/png;base64,${response.data.stylized_image}`);
      setShowPoppers(true); // Show poppers after stylizing
      playSound(); // Play sound effect
    } catch (error) {
      console.error('Error stylizing image', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = stylizedImage;
    link.download = 'stylized_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const playSound = () => {
    const sound = document.getElementById('party-sound');
    sound.play();
  };

  return (
    <div className="App">
      <h1>Image Stylization App</h1>
      <p className="quote">"Creativity is intelligence having fun!"</p> {/* Add quote below title */}

      <input
        type="file"
        onChange={(e) => handleUpload(e, setContentImage)}
        className="file-input"
      />
      <input
        type="file"
        onChange={(e) => handleUpload(e, setStyleImage)}
        className="file-input"
      />
      <button onClick={handleSubmit} className="submit-button">Stylize Image</button>

      {/* Show loading spinner and message */}
      {loading && (
        <>
          <div className="loading-spinner"></div>
          <p className="loading-message">
            Wow, excellent idea! Please wait while we cook your image in style.
          </p>
        </>
      )}

      {/* Show stylized image and download button when done */}
      {!loading && stylizedImage && (
        <>
          <img src={stylizedImage} alt="Stylized" className="stylized-image" />
          <p className="completion-message">Yay! Your stylized image is ready!</p>
          <button onClick={handleDownload} className="download-button">Download Image</button>

          {/* Party Poppers Animation */}
          {showPoppers && (
            <div id="party-poppers-container">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="party-popper">🎉</div>
              ))}
            </div>
          )}
        </>
      )}
      
      
    </div>
  );
}

export default App;
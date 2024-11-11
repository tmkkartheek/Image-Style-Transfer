import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [contentImage, setContentImage] = useState(null);
  const [styleImage, setStyleImage] = useState(null);
  const [stylizedImage, setStylizedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPoppers, setShowPoppers] = useState(false);

  const [contentPreview, setContentPreview] = useState(null);
  const [stylePreview, setStylePreview] = useState(null);
  const [warning, setWarning] = useState("");

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  const handleUpload = (event, setImage, setPreview) => {
    const file = event.target.files[0];

    // Check if the file type is allowed
    if (file && allowedTypes.includes(file.type)) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setWarning(""); // Clear any previous warnings
    } else {
      setWarning("Only .jpg, .jpeg, and .png files are allowed.");
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('content_image', contentImage);
    formData.append('style_image', styleImage);

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/stylize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStylizedImage(`data:image/png;base64,${response.data.stylized_image}`);

      setShowPoppers(true);
      playSound();
    } catch (error) {
      console.error('Error stylizing image', error);
    } finally {
      setLoading(false);
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
      <h1>Image Style Transfer</h1>
      <p className="quote">"Creativity is intelligence having fun!"</p>

      {warning && <p className="warning">{warning}</p>}

      {/* Content Image Upload and Preview */}
      <input
        type="file"
        onChange={(e) => handleUpload(e, setContentImage, setContentPreview)}
        className="file-input"
        accept=".jpg,.jpeg,.png"
      />
      {contentPreview && (
        <div>
          <h4>Original Image Preview:</h4>
          <img src={contentPreview} alt="Content Preview" style={{ maxWidth: '300px' }} />
        </div>
      )}

      {/* Style Image Upload and Preview */}
      <input
        type="file"
        onChange={(e) => handleUpload(e, setStyleImage, setStylePreview)}
        className="file-input"
        accept=".jpg,.jpeg,.png"
      />
      {stylePreview && (
        <div>
          <h4>Style Image Preview:</h4>
          <img src={stylePreview} alt="Style Preview" style={{ maxWidth: '300px' }} />
        </div>
      )}

      <button onClick={handleSubmit} className="submit-button">Stylize Image</button>

      {loading && (
        <>
          <div className="loading-spinner"></div>
          <p className="loading-message">
            Wow, excellent idea! Please wait while we cook your image in style.
          </p>
        </>
      )}

      {!loading && stylizedImage && (
        <>
          <img src={stylizedImage} alt="Stylized" className="stylized-image" />
          <p className="completion-message">Yay! Your stylized image is ready!</p>
          <button onClick={handleDownload} className="download-button">Download Image</button>

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

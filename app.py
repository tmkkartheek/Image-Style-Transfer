from flask import Flask, request, jsonify
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
from flask_cors import CORS
from PIL import Image
import io
import base64
import logging
import os

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Specify cache directory for TensorFlow Hub models
os.environ["TFHUB_CACHE_DIR"] = "./tfhub_modules_cache"

# Load the model
try:
    hub_handle = 'https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2'
    hub_module = hub.load(hub_handle)
except Exception as e:
    logger.error("Failed to load TensorFlow Hub module: %s", e)
    raise

def load_and_process_image(image_data, image_size=(256, 256)):
    img = Image.open(io.BytesIO(image_data))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img = tf.convert_to_tensor(np.array(img))
    img = tf.image.resize(img, image_size)
    img = tf.expand_dims(img, 0) / 255.0
    return img

@app.route('/stylize', methods=['POST'])
def stylize():
    try:
        content_image_data = request.files['content_image'].read()
        style_image_data = request.files['style_image'].read()

        content_image = load_and_process_image(content_image_data)
        style_image = load_and_process_image(style_image_data)

        stylized_image = hub_module(tf.constant(content_image), tf.constant(style_image))[0]

        # Convert to image and encode as base64
        stylized_image = np.squeeze(stylized_image) * 255
        stylized_image = Image.fromarray(np.uint8(stylized_image))

        buf = io.BytesIO()
        stylized_image.save(buf, format='PNG')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        return jsonify({'stylized_image': img_base64})

    except Exception as e:
        logger.error("Error during stylization: %s", e)
        return jsonify({"error": "Stylization failed"}), 500

# Endpoint to track downloads
@app.route('/download-tracking', methods=['POST'])
def download_tracking():
    user_info = request.json.get('user_info', 'Unknown User')
    logger.info(f"Image download completed by user: {user_info}")
    return jsonify({'status': 'Download tracked successfully'})

if __name__ == '__main__':
    app.run(debug=True)

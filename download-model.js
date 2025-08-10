import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Model configuration
const MODEL_CONFIG = {
  name: 'qwen2-1_5b-instruct-q4_k_m.gguf',
  url: 'https://huggingface.co/Qwen/Qwen2-1.5B-Instruct-GGUF/resolve/main/qwen2-1_5b-instruct-q4_k_m.gguf',
  size: '1.7 GB'
};

async function downloadModel() {
  const modelsDir = path.join(__dirname, 'models');
  const modelPath = path.join(modelsDir, MODEL_CONFIG.name);

  try {
    // Create models directory if it doesn't exist
    await fs.ensureDir(modelsDir);

    // Check if model already exists
    if (await fs.pathExists(modelPath)) {
      console.log(`✅ Model already exists at: ${modelPath}`);
      return modelPath;
    }

    console.log(`📥 Downloading ${MODEL_CONFIG.name} (${MODEL_CONFIG.size})...`);
    console.log(`🔗 URL: ${MODEL_CONFIG.url}`);
    console.log(`📁 Saving to: ${modelPath}`);
    console.log('⏳ This may take several minutes depending on your internet connection...\n');

    // Download the model
    const response = await axios({
      method: 'GET',
      url: MODEL_CONFIG.url,
      responseType: 'stream',
      timeout: 0, // No timeout for large downloads
    });

    const writer = fs.createWriteStream(modelPath);
    const totalSize = parseInt(response.headers['content-length'], 10);
    let downloadedSize = 0;

    response.data.on('data', (chunk) => {
      downloadedSize += chunk.length;
      const progress = ((downloadedSize / totalSize) * 100).toFixed(2);
      process.stdout.write(`\r📥 Downloading... ${progress}% (${(downloadedSize / 1024 / 1024).toFixed(1)} MB / ${(totalSize / 1024 / 1024).toFixed(1)} MB)`);
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('\n✅ Model downloaded successfully!');
        resolve(modelPath);
      });
      writer.on('error', reject);
    });

  } catch (error) {
    console.error('❌ Error downloading model:', error.message);
    throw error;
  }
}

// Run the download
downloadModel().catch(console.error);

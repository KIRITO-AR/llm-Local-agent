import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const testConfig = {
  contextSize: 2048,
  threads: 4,
  batchSize: 512,
  maxTokens: 1024,
  temperature: 0.7,
  topP: 0.9
};

// Test conversation history
const testHistory = [
  {
    role: 'user',
    content: 'Hello, how are you?',
    timestamp: new Date().toISOString(),
    messageId: 1
  },
  {
    role: 'assistant',
    content: 'I\'m doing well, thank you for asking! How can I help you today?',
    timestamp: new Date().toISOString(),
    messageId: 1
  }
];

async function testFeatures() {
  console.log('🧪 Testing Enhanced Chat Features...\n');

  // Test 1: Configuration Management
  console.log('1️⃣ Testing Configuration Management...');
  try {
    const configPath = path.join(__dirname, 'test-config.json');
    await fs.writeJson(configPath, testConfig, { spaces: 2 });
    console.log('✅ Configuration saved successfully');
    
    const loadedConfig = await fs.readJson(configPath);
    console.log('✅ Configuration loaded successfully');
    
    await fs.remove(configPath);
    console.log('✅ Test configuration cleaned up');
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
  }

  // Test 2: Conversation Export
  console.log('\n2️⃣ Testing Conversation Export...');
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-conversation-${timestamp}.json`;
    const filepath = path.join(__dirname, filename);

    const exportData = {
      timestamp: new Date().toISOString(),
      model: 'Qwen2-1.5B-Instruct',
      configuration: testConfig,
      conversation: testHistory,
      statistics: {
        totalMessages: 2,
        userMessages: 1,
        aiMessages: 1,
        conversationLength: 2
      }
    };

    await fs.writeJson(filepath, exportData, { spaces: 2 });
    console.log('✅ Conversation exported successfully');
    
    const importedData = await fs.readJson(filepath);
    console.log('✅ Conversation imported successfully');
    
    await fs.remove(filepath);
    console.log('✅ Test export cleaned up');
  } catch (error) {
    console.error('❌ Export test failed:', error.message);
  }

  // Test 3: Model File Check
  console.log('\n3️⃣ Testing Model File...');
  try {
    const modelPath = path.join(__dirname, "models", "qwen2-1_5b-instruct-q4_k_m.gguf");
    const exists = await fs.pathExists(modelPath);
    if (exists) {
      const stats = await fs.stat(modelPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
      console.log(`✅ Model file found (${sizeMB} MB)`);
    } else {
      console.log('⚠️ Model file not found - run npm run download-model first');
    }
  } catch (error) {
    console.error('❌ Model file test failed:', error.message);
  }

  // Test 4: Directory Structure
  console.log('\n4️⃣ Testing Directory Structure...');
  try {
    const modelsDir = path.join(__dirname, 'models');
    const modelsExists = await fs.pathExists(modelsDir);
    console.log(`✅ Models directory: ${modelsExists ? 'exists' : 'missing'}`);
    
    if (modelsExists) {
      const files = await fs.readdir(modelsDir);
      console.log(`✅ Found ${files.length} file(s) in models directory`);
    }
  } catch (error) {
    console.error('❌ Directory test failed:', error.message);
  }

  console.log('\n🎉 Feature tests completed!');
  console.log('\n📋 Available Commands in Chat:');
  console.log('  /help     - Show help message');
  console.log('  /config   - Show model configuration');
  console.log('  /history  - Show conversation history');
  console.log('  /clear    - Clear conversation history');
  console.log('  /stats    - Show conversation statistics');
  console.log('  /export   - Export conversation to file');
  console.log('  /save     - Save current configuration');
  console.log('  /load     - Load saved configuration');
  console.log('  /reset    - Reset model configuration');
  console.log('  /exit     - Exit the application');
}

// Run tests
testFeatures().catch(console.error);

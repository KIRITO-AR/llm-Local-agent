import { LlamaModel, LlamaContext, LlamaChatSession } from "node-llama-cpp";
import path from "path";
import readline from "readline";
import fs from "fs-extra";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Construct the path to the model file
const modelPath = path.join(__dirname, "models", "qwen2-1_5b-instruct-q4_k_m.gguf");

// Global variables for enhanced functionality
let conversationHistory = [];
let modelConfig = {
  contextSize: 2048,
  threads: 4,
  batchSize: 512,
  maxTokens: 1024,
  temperature: 0.7,
  topP: 0.9
};

// Enhanced chat session with conversation management
class EnhancedChatSession {
  constructor(context, systemPrompt) {
    this.context = context;
    this.systemPrompt = systemPrompt;
    this.session = new LlamaChatSession({ context, systemPrompt });
    this.messageCount = 0;
  }

  async prompt(userMessage, options = {}) {
    this.messageCount++;
    const timestamp = new Date().toISOString();
    
    // Add to conversation history
    conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp,
      messageId: this.messageCount
    });

    // Merge options with defaults
    const finalOptions = {
      maxTokens: modelConfig.maxTokens,
      temperature: modelConfig.temperature,
      topP: modelConfig.topP,
      ...options
    };

    try {
      const response = await this.session.prompt(userMessage, {
        ...finalOptions
      });

      // Stream the response character by character for a nice effect
      for (let i = 0; i < response.length; i++) {
        process.stdout.write(response[i]);
        // Add a small delay for streaming effect
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Add AI response to history
      conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        messageId: this.messageCount
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  getHistory() {
    return conversationHistory;
  }

  clearHistory() {
    conversationHistory = [];
    this.messageCount = 0;
    console.log("🗑️ Conversation history cleared!");
  }

  getStats() {
    return {
      totalMessages: this.messageCount,
      userMessages: conversationHistory.filter(msg => msg.role === 'user').length,
      aiMessages: conversationHistory.filter(msg => msg.role === 'assistant').length,
      conversationLength: conversationHistory.length
    };
  }
}

// Utility functions
function showHelp() {
  console.log("\n📚 Available Commands:");
  console.log("  /help     - Show this help message");
  console.log("  /config   - Show current model configuration");
  console.log("  /history  - Show conversation history");
  console.log("  /clear    - Clear conversation history");
  console.log("  /stats    - Show conversation statistics");
  console.log("  /export   - Export conversation to file");
  console.log("  /save     - Save current configuration");
  console.log("  /load     - Load saved configuration");
  console.log("  /exit     - Exit the application");
  console.log("  /reset    - Reset model configuration to defaults");
  console.log("");
}

function showConfig() {
  console.log("\n⚙️ Current Model Configuration:");
  console.log(`  Context Size: ${modelConfig.contextSize}`);
  console.log(`  Threads: ${modelConfig.threads}`);
  console.log(`  Batch Size: ${modelConfig.batchSize}`);
  console.log(`  Max Tokens: ${modelConfig.maxTokens}`);
  console.log(`  Temperature: ${modelConfig.temperature}`);
  console.log(`  Top P: ${modelConfig.topP}`);
  console.log("");
}

function showHistory() {
  if (conversationHistory.length === 0) {
    console.log("📝 No conversation history yet.");
    return;
  }

  console.log("\n📝 Conversation History:");
  conversationHistory.forEach((msg, index) => {
    const time = new Date(msg.timestamp).toLocaleTimeString();
    const role = msg.role === 'user' ? '👤 You' : '🤖 AI';
    console.log(`[${time}] ${role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
  });
  console.log("");
}

function showStats() {
  if (!global.enhancedSession) {
    console.log("📊 No active session to show statistics for.");
    return;
  }
  const stats = global.enhancedSession.getStats();
  console.log("\n📊 Conversation Statistics:");
  console.log(`  Total Messages: ${stats.totalMessages}`);
  console.log(`  User Messages: ${stats.userMessages}`);
  console.log(`  AI Messages: ${stats.aiMessages}`);
  console.log(`  Conversation Length: ${stats.conversationLength}`);
  console.log("");
}

async function exportConversation() {
  if (conversationHistory.length === 0) {
    console.log("📝 No conversation to export.");
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `conversation-${timestamp}.json`;
  const filepath = path.join(__dirname, filename);

  try {
    const exportData = {
      timestamp: new Date().toISOString(),
      model: 'Qwen2-1.5B-Instruct',
      configuration: modelConfig,
      conversation: conversationHistory,
      statistics: global.enhancedSession ? global.enhancedSession.getStats() : null
    };

    await fs.writeJson(filepath, exportData, { spaces: 2 });
    console.log(`💾 Conversation exported to: ${filename}`);
  } catch (error) {
    console.error("❌ Error exporting conversation:", error.message);
  }
}

async function saveConfig() {
  const configPath = path.join(__dirname, 'config.json');
  try {
    await fs.writeJson(configPath, modelConfig, { spaces: 2 });
    console.log("💾 Configuration saved to config.json");
  } catch (error) {
    console.error("❌ Error saving configuration:", error.message);
  }
}

async function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');
  try {
    if (await fs.pathExists(configPath)) {
      const savedConfig = await fs.readJson(configPath);
      modelConfig = { ...modelConfig, ...savedConfig };
      console.log("📂 Configuration loaded from config.json");
      showConfig();
    } else {
      console.log("📂 No saved configuration found.");
    }
  } catch (error) {
    console.error("❌ Error loading configuration:", error.message);
  }
}

function resetConfig() {
  modelConfig = {
    contextSize: 2048,
    threads: 4,
    batchSize: 512,
    maxTokens: 1024,
    temperature: 0.7,
    topP: 0.9
  };
  console.log("🔄 Configuration reset to defaults");
  showConfig();
}

// Main function to run the chat
async function main() {
  try {
    // Check if model exists
    if (!await fs.pathExists(modelPath)) {
      console.log("❌ Model not found!");
      console.log("📥 Please run 'npm run download-model' first to download the model.");
      console.log(`📁 Expected location: ${modelPath}`);
      process.exit(1);
    }

    console.log("🦙 Loading model...");
    console.log(`📁 Model path: ${modelPath}`);

    // Instantiate the model
    const model = new LlamaModel({
      modelPath: modelPath,
    });

    // Create a context for the model
    const context = new LlamaContext({ 
      model, 
      contextSize: modelConfig.contextSize,
      threads: modelConfig.threads,
      batchSize: modelConfig.batchSize
    });

    // Create enhanced chat session
    global.enhancedSession = new EnhancedChatSession(
      context,
      "You are a helpful, friendly, and knowledgeable AI assistant. You provide accurate, helpful, and engaging responses to user questions and requests."
    );

    console.log("✅ Model loaded successfully!");
    console.log("💬 Start chatting with your local AI! Type '/help' for available commands.");
    console.log("💡 Try asking questions, requesting help with tasks, or just having a conversation!\n");

    // Load saved configuration if exists
    await loadConfig();

    // Start the interactive chat loop
    chatLoop();

    function chatLoop() {
      rl.question("🤖 You: ", async (prompt) => {
        if (prompt.toLowerCase() === 'exit' || prompt.toLowerCase() === '/exit') {
          console.log("👋 Goodbye! Thanks for chatting!");
          rl.close();
          process.exit(0);
        }

        if (prompt.trim() === '') {
          chatLoop();
          return;
        }

        // Handle special commands
        if (prompt.startsWith('/')) {
          await handleCommand(prompt);
          chatLoop();
          return;
        }

        process.stdout.write("🤖 AI: ");
        
        try {
          await global.enhancedSession.prompt(prompt);
          process.stdout.write("\n\n");
        } catch (error) {
          console.error("\n❌ Error generating response:", error.message);
        }

        chatLoop();
      });
    }

    async function handleCommand(command) {
      const cmd = command.toLowerCase().trim();
      
      switch (cmd) {
        case '/help':
          showHelp();
          break;
        case '/config':
          showConfig();
          break;
        case '/history':
          showHistory();
          break;
        case '/clear':
          global.enhancedSession.clearHistory();
          break;
        case '/stats':
          showStats();
          break;
        case '/export':
          await exportConversation();
          break;
        case '/save':
          await saveConfig();
          break;
        case '/load':
          await loadConfig();
          break;
        case '/reset':
          resetConfig();
          break;
        default:
          console.log("❓ Unknown command. Type '/help' for available commands.");
      }
    }

  } catch (error) {
    console.error("❌ Error loading model:", error.message);
    console.error("💡 Make sure you have enough RAM and the model file is not corrupted.");
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log("\n👋 Goodbye! Thanks for chatting!");
  rl.close();
  process.exit(0);
});

// Run the main function and handle any errors
main().catch(console.error);

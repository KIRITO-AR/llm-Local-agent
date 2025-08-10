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
      contextSize: 2048,
      threads: 4, // Adjust based on your CPU cores
      batchSize: 512
    });

    // Create a chat session
    const session = new LlamaChatSession({
      context,
      // The Qwen2 model uses a specific system prompt format
      systemPrompt: "You are a helpful, friendly, and knowledgeable AI assistant. You provide accurate, helpful, and engaging responses to user questions and requests.",
    });

    console.log("✅ Model loaded successfully!");
    console.log("💬 Start chatting with your local AI! Type 'exit' to end the conversation.");
    console.log("💡 Try asking questions, requesting help with tasks, or just having a conversation!\n");

    // Start the interactive chat loop
    chatLoop();

    function chatLoop() {
      rl.question("🤖 You: ", async (prompt) => {
        if (prompt.toLowerCase() === 'exit') {
          console.log("👋 Goodbye! Thanks for chatting!");
          rl.close();
          process.exit(0);
        }

        if (prompt.trim() === '') {
          chatLoop();
          return;
        }

        process.stdout.write("🤖 AI: ");
        
                 try {
           // The `prompt` method sends the user message and gets the AI's response
           const aiResponse = await session.prompt(prompt, {
             onToken(chunk) {
               // Stream the response token by token to the console
               process.stdout.write(context.decode(chunk));
             },
             maxTokens: 1024, // Limit response length
             temperature: 0.7, // Add some creativity
             topP: 0.9, // Nucleus sampling
           });
           process.stdout.write("\n\n"); // Add spacing after the full response
         } catch (error) {
           console.error("\n❌ Error generating response:", error.message);
         }

        chatLoop(); // Continue the loop for the next message
      });
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

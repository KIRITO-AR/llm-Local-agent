# Local LLM Chat Application

A Node.js application that runs a powerful language model locally using `node-llama-cpp`. This project allows you to chat with the Qwen2-1.5B-Instruct model completely offline.

## Features

- 🚀 **Local Processing**: No internet required after model download
- 💬 **Interactive Chat**: Real-time conversation with streaming responses
- 🦙 **Llama.cpp Backend**: Efficient C++ implementation for fast inference
- 📦 **Easy Setup**: Simple installation and model download process
- 🔧 **Configurable**: Adjustable parameters for different use cases
- 📚 **Command System**: Built-in commands for enhanced functionality
- 💾 **Data Management**: Conversation history, export, and statistics
- ⚙️ **Advanced Configuration**: Persistent settings and optimization options

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **At least 4GB RAM** (8GB+ recommended)
- **~2GB free disk space** for the model

## Installation

1. **Clone or download this project**
   ```bash
   git clone <repository-url>
   cd llm-local
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   ⚠️ **Note**: The `node-llama-cpp` installation may take several minutes as it compiles C++ code.

3. **Download the model**
   ```bash
   npm run download-model
   ```
   
   This will download the Qwen2-1.5B-Instruct model (~1.7GB) from Hugging Face.

## Usage

### Start the Chat Application

```bash
npm start
```

Or directly:
```bash
node chat.js
```

### Chat Commands

- Type your message and press Enter to chat
- Type `exit` or `/exit` to quit the application
- Press `Ctrl+C` to force quit

### Built-in Commands

The application includes several built-in commands for enhanced functionality:

- `/help` - Show available commands
- `/config` - Display current model configuration
- `/history` - View conversation history
- `/clear` - Clear conversation history
- `/stats` - Show conversation statistics
- `/export` - Export conversation to JSON file
- `/save` - Save current configuration
- `/load` - Load saved configuration
- `/reset` - Reset model configuration to defaults

### Example Conversation

```
🦙 Loading model...
📁 Model path: /path/to/models/qwen2-1_5b-instruct-q4_k_m.gguf
✅ Model loaded successfully!
💬 Start chatting with your local AI! Type '/help' for available commands.

🤖 You: Hello! Can you tell me a fun fact about space?
🤖 AI: Of course! Did you know that there's a giant cloud of alcohol in space? 
Sagittarius B2, a vast molecular cloud near the center of our galaxy, contains 
billions of liters of vinyl alcohol. Cheers to that! 🚀

🤖 You: /stats
📊 Conversation Statistics:
  Total Messages: 2
  User Messages: 1
  AI Messages: 1
  Conversation Length: 2

🤖 You: /export
💾 Conversation exported to: conversation-2024-01-15T10-30-45-123Z.json

🤖 You: /exit
👋 Goodbye! Thanks for chatting!
```

## Enhanced Features

### Conversation Management
- **Automatic History**: All conversations are automatically tracked with timestamps
- **Statistics**: View detailed conversation analytics with `/stats`
- **Export**: Save conversations to JSON files with metadata using `/export`
- **Clear History**: Reset conversation memory with `/clear`

### Configuration Management
- **Persistent Settings**: Save and load your preferred model settings
- **Easy Reset**: Return to default configuration with `/reset`
- **Real-time Display**: View current settings with `/config`

### Data Export Format
Exported conversations include:
- Timestamp and model information
- Complete conversation history
- Model configuration used
- Conversation statistics
- Message IDs for tracking

## Configuration

You can modify the model parameters in `chat.js`:

```javascript
const context = new LlamaContext({ 
  model, 
  contextSize: 2048,    // Memory context size
  threads: 4,           // CPU threads (adjust based on your CPU)
  batchSize: 512        // Batch size for processing
});

const aiResponse = await session.prompt(prompt, {
  maxTokens: 1024,      // Maximum response length
  temperature: 0.7,     // Creativity (0.0-1.0)
  topP: 0.9,           // Nucleus sampling
});
```

## Model Information

- **Model**: Qwen2-1.5B-Instruct
- **Format**: GGUF (optimized for Llama.cpp)
- **Quantization**: Q4_K_M (4-bit, medium quality)
- **Size**: ~1.7GB
- **Performance**: Good balance of speed and quality

## Troubleshooting

### Common Issues

1. **"Model not found" error**
   - Run `npm run download-model` first
   - Check that the model file exists in the `models/` directory

2. **Out of memory errors**
   - Reduce `contextSize` in the configuration
   - Close other applications to free up RAM
   - Consider using a smaller model

3. **Slow performance**
   - Increase `threads` to match your CPU cores
   - Reduce `batchSize` if memory is limited
   - Ensure you have enough free RAM

4. **Installation fails**
   - Make sure you have Node.js v18+
   - On Windows, you may need Visual Studio Build Tools
   - Try clearing npm cache: `npm cache clean --force`

### System Requirements

- **Minimum**: 4GB RAM, 2GB free space
- **Recommended**: 8GB+ RAM, 4GB free space
- **CPU**: Multi-core processor (4+ cores recommended)

## Testing

### Run Feature Tests
```bash
npm test
```
This will test all enhanced features including:
- Configuration management
- Conversation export
- Model file validation
- Directory structure verification

### View Demo
```bash
node demo.js
```
Shows a comprehensive overview of all available features and usage examples.

## Alternative Models

You can use other GGUF models by:
1. Downloading a different model file
2. Updating the `modelPath` in `chat.js`
3. Adjusting the system prompt if needed

Popular alternatives:
- **Llama 2 7B**: Larger, more capable
- **Mistral 7B**: Good performance/size ratio
- **Phi-2**: Microsoft's small but effective model

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

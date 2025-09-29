# LocalAI 🤖

**Run powerful AI models locally in your browser - no servers, no API keys, complete privacy.**

![LocalAI Logo](https://i.imgur.com/zi4vHEt.png)

## 🌟 Live Demo

**[👉 Try LocalAI Now](https://renanbazinin.github.io/localAI/)**

## ✨ Features

- 🔒 **100% Private**: Your data never leaves your device
- ⚡ **No Internet Required**: Works offline after initial load
- 🧠 **Qwen2.5 Coder**: Advanced AI coding assistant
- 🚀 **Browser-Native**: Runs entirely in your web browser
- 💰 **No API Costs**: No rate limits or subscription fees
- 🎯 **Code Generation**: Python, JavaScript, and more

## 🚀 How It Works

LocalAI serves the **Qwen2.5-Coder-1.5B-Instruct** model locally using ONNX and [Transformers.js](https://huggingface.co/docs/transformers.js). The entire AI model runs in your browser via WebAssembly - no server required!

### Tech Stack
- **Model**: Qwen2.5-Coder-1.5B-Instruct (quantized ONNX)
- **Runtime**: ONNX Runtime Web + WebAssembly
- **Frontend**: React + Vite
- **AI Library**: Transformers.js
- **Quantization**: INT8 for optimal size/performance balance

## 🛠️ Development

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- 12 GB+ RAM (for model loading)
- Modern browser with WebAssembly SIMD support

### Local Setup

```bash
# Clone the repository
git clone https://github.com/renanbazinin/localAI.git
cd localAI

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action.

### Build for Production

```bash
# Build the app
npm run build

# Preview the built app
npm run preview
```

### Deploy to GitHub Pages

```bash
# Deploy to GitHub Pages
npm run deploy
```

## 📁 Project Structure

```
localAI/
├── models/                          # Local ONNX model files
│   └── onnx-community/
│       └── Qwen2.5-Coder-1.5B-Instruct/
├── src/
│   ├── App.jsx                     # Main React component
│   ├── App.css                     # App styles
│   └── main.jsx                    # React entry point
├── index.html                      # Landing page + app container
├── vite.config.js                  # Vite configuration
└── package.json                    # Project dependencies
```

## 🎯 Usage Tips

1. **First Load**: The model (~1.8GB) downloads and loads into memory
2. **Token Control**: Adjust generation length (64-1024 tokens)
3. **Browser Freezing**: Normal during generation - the loading overlay shows progress
4. **Memory Usage**: Close other tabs for optimal performance
5. **Prompt Engineering**: Be specific for better code generation

## 🔧 Configuration

### Model Variants
The app uses the INT8 quantized model by default. You can switch variants in `src/App.jsx`:

- `int8`: Best compatibility (1.8 GB)
- `q4f16`: Smallest size (1.34 GB)
- `q4`: 4-bit quantized (1.92 GB)

### Session Options
WebAssembly execution is configured for maximum stability:
- Single-threaded execution
- Sequential processing
- Disabled memory patterns
- Basic graph optimization

## 🌐 Browser Compatibility

- ✅ Chrome 109+ (recommended)
- ✅ Edge 109+
- ✅ Firefox 117+
- ✅ Safari 16+ (with limitations)

**Note**: WebAssembly SIMD support is required for optimal performance.

## 📊 Performance

| Model | Size | RAM Usage | Load Time | Generation Speed |
|-------|------|-----------|-----------|------------------|
| int8  | 1.8 GB | ~4 GB | 2-3 min | ~2-5 tokens/sec |
| q4f16 | 1.34 GB | ~3 GB | 1-2 min | ~3-6 tokens/sec |

*Performance varies by device and browser*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for Transformers.js
- [Alibaba Qwen Team](https://huggingface.co/Qwen) for the Qwen2.5-Coder model
- [Microsoft ONNX Runtime](https://onnxruntime.ai/) for WebAssembly inference
- [onnx-community](https://huggingface.co/onnx-community) for model conversion

---

**Made with ❤️ by [Renan Bazinin](https://github.com/renanbazinin)**

*Experience the future of private, local AI - right in your browser.*
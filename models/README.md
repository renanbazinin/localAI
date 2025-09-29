# Models Directory

This directory contains the configuration files for the Qwen2.5-Coder-1.5B-Instruct model.

## For Local Development

If you want to run the model locally (faster performance), download the ONNX model files:

```bash
# Clone the full model repository
git clone https://huggingface.co/onnx-community/Qwen2.5-Coder-1.5B-Instruct models/onnx-community/Qwen2.5-Coder-1.5B-Instruct-full

# Copy the ONNX files
cp models/onnx-community/Qwen2.5-Coder-1.5B-Instruct-full/onnx/* models/onnx-community/Qwen2.5-Coder-1.5B-Instruct/onnx/
```

## For Production (GitHub Pages)

The app automatically downloads the model from Hugging Face when local files are not available. This is perfect for GitHub Pages deployment since the ONNX files are too large (1.8GB) to include in the repository.

## Model Files

- `config.json` - Model configuration
- `generation_config.json` - Generation settings  
- `tokenizer.json` - Tokenizer configuration
- `tokenizer_config.json` - Additional tokenizer settings
- `vocab.json` - Vocabulary mapping
- `merges.txt` - BPE merges
- `onnx/` - ONNX model files (download separately for local use)

## Model Variants

The app uses the `int8` quantized version for best compatibility:
- `model_int8.onnx` - INT8 quantized model (1.8 GB)
- More stable than q4f16 variants
- Better browser compatibility
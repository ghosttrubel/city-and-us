# City & Us local dialogue build

Build-time tools only; no model, synthesis engine, external API or microphone is included in the game.

1. Install Node.js 22 or later.
2. From this folder run `npm ci --ignore-scripts` (Windows CPU runtime is bundled by onnxruntime-node; GPU/CUDA is unnecessary).
3. Run `npm run generate`.

The script downloads the q8 model and tokenizer files from the pinned Hugging Face revision recorded in download-model.mjs. It reads the original dialogue script at ../../dist/dialogue-lines.js and writes PCM16 mono 24 kHz WAVs plus a SHA-256 manifest to ../../dist/assets/dialogue. Existing matching clips are retained. Model and dependency caches are ignored and must not be bundled with Android or served to phones.

Kokoro-js 1.2.1 and its stock voice vectors are Apache-2.0. The upstream Kokoro model and ONNX export are labelled Apache-2.0. The model card explicitly permits production deployments. The bundled scripts are original game dialogue. No named person's voice was cloned or requested, and no paid service was used.

Sources:
- https://github.com/hexgrad/kokoro/tree/main/kokoro.js
- https://huggingface.co/hexgrad/Kokoro-82M
- https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/1939ad2a8e416c0acfeecc08a694d14ef25f2231

The game receives generated recordings only. Build dependency licenses remain in node_modules and the lockfile; Kokoro's Apache notice is copied alongside the recordings. This is synthetic English speech with English/Pidgin wording, not a verified Nigerian accent. Listening, pronunciation and real-device audio acceptance remain pending; waveform and hash checks cannot establish natural delivery.

Generation uses one CPU inference thread to keep this modest laptop responsive during Android builds. It checkpoints after every phrase; rerunning retains clips whose text, voice, model revision and hash match.

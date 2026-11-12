# City & Us dialogue recordings

Original City & Us lines from ../../dialogue-lines.js, rendered locally with Kokoro-js 1.2.1 and the Apache-2.0 Kokoro model. WAVs are PCM16, mono, 24 kHz. NPC clips use one stock voice per scripted role; player responses have female and male stock voice variants. These voices are not cloned from any requested person.

Licensing and reproducibility:
- Kokoro source and stock vectors: https://github.com/hexgrad/kokoro/tree/main/kokoro.js (Apache-2.0, included LICENSE-Kokoro-Apache-2.0.txt).
- Upstream model card: https://huggingface.co/hexgrad/Kokoro-82M (Apache-2.0; production deployment permitted).
- ONNX model revision: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/1939ad2a8e416c0acfeecc08a694d14ef25f2231 (Apache-2.0).
- Per-recording text, voice ID, duration, byte size and SHA-256 are in manifest.json. The manifest also records model and voice-vector hashes.
- Portable build: ../../../tools/voice-build/README.md in the full source checkout.

The game only plays these bundled recordings. The model, phonemizer and inference engine are build tools and are not shipped in the game. No online TTS API, paid voice service, microphone capture, remote inference or live chat is involved.

Limitations: these are synthetic English voices reading short English/Pidgin lines, not professionally recorded Nigerian/Pidgin performances. No verified Nigerian accent, phoneme-accurate facial animation, listening approval or real-device audio acceptance is claimed. Use review.html to listen for pronunciation, pacing, intelligibility, loudness and clipping on the phone; then verify the same lines in-game with response order, captions, mute, volume and interruptions.

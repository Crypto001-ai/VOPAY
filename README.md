<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/df35650e-2ba4-4ce7-9087-ad178346ead3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Solana Program

The Anchor program now lives in this same folder:

- Program source: `programs/vopay/src`
- Anchor config: `Anchor.toml`
- Frontend IDL: `src/idl/vopay.json`
- Devnet program ID: `2BqHZjo6i4qGLeqU43KFHeW7qwymY9PXc5J5iXzsrsKK`

Useful commands:

```bash
npm run anchor:build
npm run anchor:deploy
npm run anchor:test
```

The frontend should use:

```bash
VITE_VOPAY_PROGRAM_ID=2BqHZjo6i4qGLeqU43KFHeW7qwymY9PXc5J5iXzsrsKK
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

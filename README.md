<<<<<<< HEAD

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ProShop Manager

ProShop Manager is a modern retail management dashboard that combines POS, inventory control, sales analytics, and team settings into one streamlined app.

This repository contains everything you need to run the app locally.

View your app in AI Studio: https://ai.studio/apps/14f614d4-71e7-4619-a04c-f83f6099bb15

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set the `GEMINI_API_KEY` if you plan to use AI features:

   ```bash
   cp .env.example .env.local
   # then edit .env.local and add GEMINI_API_KEY
   ```

3. Run the app in development mode:

   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

## Contact

Maintainer: bismillahkhanweb — bismillahkhan.web@gmail.com

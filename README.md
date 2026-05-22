# bolao-da-copa
World Cup sweepstake ("Bolão") web app built as a PWA with Vite + React + Firebase.

## Prerequisites

- Node.js 20+
- npm 10+
- A Firebase project (for Auth, Firestore, and Hosting)

## Local development

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Then fill in all Firebase values in `.env`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 3) Run the app

```bash
npm run dev
```

By default, Vite will print the local URL in the terminal (usually `http://localhost:5173`).

## Available commands

- `npm run dev`: start development server
- `npm run build`: type-check and create production build
- `npm run preview`: serve the production build locally
- `npm run test`: run unit tests with Vitest
- `npm run lint`: run ESLint

## Deploy automation with GitHub Actions

This repository includes automated Firebase Hosting deploy workflows:

- `.github/workflows/deploy-staging.yml`
  - runs on Pull Requests to `main`;
  - installs dependencies and builds the app;
  - deploys to Firebase Hosting `staging` channel;
  - automatically comments on the PR with the preview URL.
- `.github/workflows/deploy-production.yml`
  - runs on pushes to `main`;
  - installs dependencies and builds the app;
  - deploys to Firebase Hosting `live` channel.

## Required GitHub secrets

Configure these in **Settings > Secrets and variables > Actions**:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_BOLAO_DA_COPA`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## How to create the Firebase service account secret

1. Open your Firebase project in Firebase Console.
2. Go to **Project settings > Service accounts**.
3. Generate a new private key (JSON).
4. Save the JSON content in GitHub secret `FIREBASE_SERVICE_ACCOUNT_BOLAO_DA_COPA`.

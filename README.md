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

#### Where to find these Firebase values

These values come from the **Firebase Web App config object** for your Firebase project.

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your Firebase project, or create one if it does not exist yet.
3. In **Project settings > General**, scroll to **Your apps**.
4. If you do not already have a Web app, click the Web icon (`</>`) to register one.
5. Select the Web app nickname in **Your apps**.
6. In **Firebase SDK snippet**, select **Config**.
7. Copy the values from the `firebaseConfig` object into `.env` using this mapping:

| Firebase config key | `.env` variable |
| --- | --- |
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

Example source object from Firebase:

```ts
const firebaseConfig = {
  apiKey: "...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```

> Note: Firebase describes these Web config values as project/app identifiers, not private secrets. The app still relies on Firebase Authentication, Firestore Security Rules, and authorized domains to protect data. Do not commit your local `.env` file.

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

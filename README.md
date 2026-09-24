# Papertrail

Real-time collaborative book editor backend built with Node.js, Express, TypeScript, MongoDB, and Yjs.

## Requirements

* Node.js 20+
* npm
* MongoDB running locally or a MongoDB Atlas connection

## Setup

From this directory:

```bash
npm install
```

The required `.env` file is already included in the project, so no additional environment configuration is required.

## Run

Start the backend from this directory:

```bash
npm run dev
```

The HTTP API runs at http://localhost:5000 and the Yjs WebSocket server runs at `ws://localhost:1234` by default.

Start the frontend in a second terminal from the `Frontend` directory:

```bash
npm run dev
```

The frontend will run at http://localhost:5173.

## Other commands

```bash
npm run build
npm start
```

The backend must be running for authentication, books, pages, and real-time collaboration to work.

# MetaMesh

An immersive virtual office platform that enables real-time collaboration through a 2D interactive map, proximity chat, and embedded tools.

## Features

- **Proximity Chat**: Distance-based video and audio communication.
- **Interactive Workspace**: Move around a 2D map with an avatar.
- **Screen Sharing**: flexible and immediate screen sharing capabilities.
- **Embedded Whiteboards**: Collaborate using integrated whiteboards.
- **Multifunctional Rooms**: specialized areas for different tasks.
- **Chat System**: Real-time text messaging with dialogue bubbles.
- **User Authentication**: Secure identification via MongoDB and JWT.
- **Customizable**: Create and manage custom rooms.

## Tech Stack

- **Frontend**: React, Redux, Phaser 3, TypeScript, Vite
- **Backend**: Node.js, Express, Colyseus (WebSocket), TypeScript
- **Database**: MongoDB
- **Communication**: WebRTC (PeerJS) for media, WebSockets for game state

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or via Atlas)

## Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/MetaMesh.git
    cd MetaMesh
    ```

2.  **Install Server Dependencies**

    ```bash
    yarn install
    # or
    npm install
    ```

3.  **Install Client Dependencies**
    ```bash
    cd client
    yarn install
    # or
    npm install
    ```

## Configuration

### Server Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRATION=
```

### Client Configuration

Create a `.env` file in the `client` directory based on `.client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:2567
VITE_WS_URL=ws://localhost:2567
```

## Running the Application

You will need to run the server and client in separate terminal windows.

### 1. Start the Server

From the root directory:

```bash
yarn start
# or
npm start
```

The server will start on port 2567 (or your configured PORT).

### 2. Start the Client

From the `client` directory:

```bash
cd client
yarn dev
# or
npm run dev
```

The client will start (usually at http://localhost:5173).

## Building for Production

### Client Build

To build the frontend for production:

```bash
cd client
yarn build
```

The artifacts will be generated in the `client/dist` directory.

### Server Build

To compile the TypeScript server code:

```bash
npm run heroku-postbuild
```



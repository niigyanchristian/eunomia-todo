# Monorepo Project

A full-stack application with Express backend and React frontend.

## Project Structure

```
.
├── backend/          # Express API server
│   ├── src/
│   │   └── index.js  # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/         # React + Vite application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Tech Stack

### Backend
- Node.js
- Express.js
- CORS
- dotenv

### Frontend
- React 18
- Vite 5
- ESLint

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Configuration

1. Backend environment setup
```bash
cd backend
cp .env.example .env
```

Edit `.env` file to configure:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Running the Application

#### Development Mode

1. Start the backend server
```bash
cd backend
npm run dev
```
The API server will run on `http://localhost:3000`

2. Start the frontend development server (in a new terminal)
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

#### Production Build

1. Build the frontend
```bash
cd frontend
npm run build
```

2. Preview the production build
```bash
npm run preview
```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Frontend Features

- Hot Module Replacement (HMR) for fast development
- ESLint for code quality
- Proxy configuration for API calls to backend

## Available Scripts

### Backend
- `npm start` - Start the server
- `npm run dev` - Start with hot reload (using --watch)

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Development

The frontend is configured to proxy API requests to the backend. Any request to `/api/*` will be forwarded to `http://localhost:3000`.

## License

ISC

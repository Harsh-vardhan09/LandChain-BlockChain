# Land Registry Frontend

A modern React application with Vite, Tailwind CSS, and MetaMask wallet integration.

## Features

- 🏠 **Home Page** - Welcome and overview
- 📊 **Dashboard** - Register new lands
- 📋 **Land List** - Search and view all lands
- 🔍 **Land Details** - View detailed information and manage ownership
- 💳 **MetaMask Integration** - Connect wallet and sign transactions
- ⛓️ **Blockchain Integration** - Interact with smart contracts
- 🎨 **Tailwind CSS** - Modern UI styling
- 📡 **Axios API** - Backend communication
- 📊 **Transaction Status** - Real-time transaction updates

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- MetaMask browser extension

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and update:

```
VITE_API_URL=http://localhost:3000
```

### Development

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/           # Page components (Home, Dashboard, LandList, LandDetails)
│   ├── components/      # Reusable components (Header, Footer, ConnectWallet, TransactionStatus)
│   ├── context/         # React Context (WalletContext)
│   ├── services/        # API service (apiService)
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind CSS
├── index.html
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Usage

1. **Connect Wallet**: Click "Connect MetaMask" button in the header
2. **Register Land**: Go to Dashboard and fill in the land details
3. **Search Lands**: Navigate to Lands page and search by ID
4. **View Details**: Click on a land card to see full details
5. **Transfer Ownership**: On land details page, click "Transfer Ownership"
6. **Verify Land**: Admin users can verify lands from the details page

## API Endpoints

- `POST /land/register` - Register a new land
- `POST /land/verify` - Verify a land (admin only)
- `POST /land/transfer` - Transfer land ownership
- `GET /land/:id` - Get land details

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- Axios
- Ethers.js
- React Router v6

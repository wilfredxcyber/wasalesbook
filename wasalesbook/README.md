<div align="center">
  <img src="public/logo.png" width="100" height="100" alt="Whatsbook Logo" />
  <h1>Whatsbook</h1>
  <p><b>The ultimate localized sales and order management application built for independent sellers and small businesses running on WhatsApp.</b></p>
</div>

<br/>

Salesbook (now **Whatsbook**) is a streamlined MVP progressive web app that allows you to manage orders seamlessly without the bloat of traditional POS software. Designed specifically for the fast-paced nature of DM-style selling, it features built-in tools like WhatsApp deep-linking, quick product catalogs, and AI-powered data extraction.

##  Features

- **Dashboard**: Track your daily revenue, collections, pending deliveries, and recent order statuses at a glance.
- **AI Smart Paste**: Drop an unstructured message (e.g., from WhatsApp or Instagram) and let Gemini AI instantly extract customer details, products, and prices, automatically filling your order form.
- **Product Catalogue**: Create an inventory with photos, prices, capabilities, and categories for quick 1-tap additions to bills.
- **Order Tracking**: Manage the lifestyle of your orders (Unpaid ↔ Paid, Pending ↔ Delivered).
- **Local Persistence & Privacy**: Your data belongs to you. Stored securely and entirely on your local device.

##  Getting Started

### Prerequisites

- Node.js (v18 or higher)
- **Optional**: Ai API Key to enable the heavily requested **AI Smart Paste** feature.

### Installation

1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your API Keys (If using Smart Paste):
   ```bash
   cp .env.example .env
   ```
   Add your `VITE_GEMINI_API_KEY` to the `.env` file.

### Running Locally

Start the Vite development server:
```bash
npm run dev
```

Your app will be automatically served at [http://localhost:3000](http://localhost:3000).

## 📄 License
MIT

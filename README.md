# AquaSmart: Smart Water Management & Billing System

AquaSmart is a production-quality full-stack web application built using the MERN stack. It enables users to track their weekly water consumption, analyze trends through interactive visualizations, manage and pay bills, and receive data-driven suggestions for water conservation.

## 🚀 Features

### 1. Advanced Authentication
- **JWT-based Security**: Secure login and signup with token-based authorization.
- **Protected Routes**: Dashboard and management features are restricted to authenticated users.
- **Admin & User Roles**: Role-based access control for system-wide monitoring.

### 2. Intelligent Usage Tracking
- **Interactive Input**: Card-based, multi-step form with sliders for category-wise entry (Bathing, Kitchen, Toilet, Washing, Gardening).
- **Weekly Management**: Tracks consumption based on household size and specific dates.

### 3. Real-time Analytics
- **Dynamic Charts**: Pie charts for category distribution and bar charts for usage trends (using Recharts).
- **Consumption Map**: Visual breakdown of where most water is being used.
- **Leak Detection**: Automated algorithms that detect >30% consumption increases and trigger alerts.

### 4. Slab-Based Billing & Payments
- **Smart Estimation**: Automatic bill generation based on consumption tiers (₹2, ₹3, and ₹5 per liter).
- **Detailed Invoices**: Full breakdown of costs per slab.
- **Payment Simulation**: Razorpay-style interactive payment interface with transaction tracking.

### 5. "Reduce My Bill" Insights
- **Intelligent Suggestions**: A rule-based engine that analyzes patterns and provides actionable tips to save water.
- **Personalized Goals**: Suggests ideal targets based on your household's profile.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion (Animations), Recharts (Charts), Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Auth**: JSON Web Tokens (JWT).

## 📦 Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed locally or an Atlas URI

### Installation

1. **Clone the repository**
   ```bash
   cd "SMART WATER"
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Configure .env with your MONGO_URI and JWT_SECRET
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

### Default Admin Credentials (Seed)
*Note: Create a user via signup and change the 'role' in MongoDB to 'admin' to access the admin dashboard.*

## 🌟 Quality Highlights
- **Glassmorphism UI**: High-end modern SaaS aesthetic.
- **Mobile First**: Fully responsive across all devices.
- **Micro-interactions**: Smooth transitions and hover effects using Framer Motion.
- **Clean Code**: Separated controllers, routes, models, and utility logic.

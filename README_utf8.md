# Kunj Creation Web App 🌸

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?logo=mongodb&logoColor=white)](https://www.mongodb.com/)


## 🌟 Features

- **Handcrafted Quality** – Each product made with love and faith for your deity.
- **Divine Collection** – Dresses, jewelry & festive ensembles with traditional touch.
- **Replacement** – Easy exchange for size issues.
- **Pagdi Customization** – Select your desired Pagdi size (Metal/Marble).
- **Invoice PDF** – Download invoice for your orders.
- **Admin Dashboard** – Manage products, sliders, and orders.

---

## 🏗 Project Structure

backend/
├─ config/
│ ├─ cloudinary.js
│ ├─ db.js
│ └─ firebaseAdmin.js
├─ controllers/
│ ├─ adminController.js
│ ├─ orderController.js
│ ├─ productController.js
│ ├─ sliderController.js
│ └─ userController.js
├─ middleware/
│ ├─ authMiddleware.js
│ └─ multer.js
├─ models/
│ ├─ Admin.js
│ ├─ counterModel.js
│ ├─ orderModel.js
│ ├─ Products.js
│ ├─ SliderImage.js
│ └─ userModel.js
└─ index.js

client/
├─ public/
│ ├─ favicon.png
│ ├─ robots.txt
│ └─ _redirects
├─ src/
│ ├─ assets/
│ ├─ components/
│ │ ├─ admin/
│ │ ├─ layout/
│ │ ├─ products/
│ │ └─ ui/
│ ├─ context/
│ ├─ data/
│ ├─ hooks/
│ ├─ lib/
│ └─ pages/
└─ App.tsx



---

## 💻 Tech Stack

- **Frontend:** React, TypeScript, Vite, ShadCN UI, Context API
- **Backend:** Node.js, Express, MongoDB, Cloudinary, Firebase Admin
- **Utilities:** jsPDF, html2canvas, Axios

---

## ⚡ Installation

### Backend

```bash
cd backend
npm install
npm run dev



📦 API Endpoints (Backend)

/api/orders – GET/POST/DELETE orders

/api/products – CRUD products

/api/admin – Admin login & management

/api/sliders – Slider images management

/api/users – User management


🔗 Useful Links

React Documentation

Node.js Documentation

MongoDB Documentation




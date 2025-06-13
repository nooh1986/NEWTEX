# NEWTEX - Textile Business Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.x-green.svg)
![Python](https://img.shields.io/badge/Python-3.x-green.svg)

A comprehensive textile business management system built with React (TypeScript) frontend and Flask (Python) backend. This system provides complete management for textile manufacturing operations including inventory, sales, orders, and warehouse management.

## 🌟 Features

### 📊 Dashboard
- **Real-time Sales Analytics** with dynamic filtering (Yesterday, Last Week, Last Month, Last 3 Months)
- **Interactive Charts** for sales comparison and product analysis
- **Key Performance Indicators** with visual cards
- **Quick Navigation** to different system modules

### 🏭 Warehouse Management
- **Classic Warehouse** - Traditional textile inventory
- **Chinese Warehouse** - Imported textile products
- **Scrap Warehouse** - Waste and defective materials
- **Real-time Inventory Tracking** with quantities and lengths
- **Color and Type Categorization**

### 📦 Order Management
- **Orders in Progress** - Active manufacturing orders
- **Late Orders** - Overdue order tracking
- **Ready Orders** - Completed orders awaiting shipment
- **Order Details** with comprehensive information
- **Mobile-responsive** order tables

### 💰 Sales Analytics
- **Classic Sales Module** - Traditional product sales analysis
- **Chinese Sales Module** - Imported product sales tracking
- **Customer Analytics** - Top customers and sales patterns
- **Product Performance** - Best-selling products analysis
- **Time-based Filtering** - Flexible date range selection

### 💵 Pricing Management
- **Product Categories** (Tasaneef) - Hierarchical pricing structure
- **Individual Product Pricing** (Dasanat) - Specific item pricing
- **Quality Details** - Grade-based pricing tiers

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **Responsive Design** for mobile compatibility
- **RTL Support** for Arabic interface

### Backend
- **Flask** (Python web framework)
- **SQLAlchemy** for database operations
- **RESTful API** architecture
- **CORS** enabled for cross-origin requests
- **SQL Server** database integration

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- SQL Server or compatible database

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

## 📁 Project Structure

```
NEWTEX/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── الاسعار/     # Pricing components
│   │   │   ├── الطلبيات/    # Orders components
│   │   │   ├── المبيعات/    # Sales components
│   │   │   └── المستودعات/  # Warehouse components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Flask Python backend
│   ├── routes/
│   │   └── warehouse.py     # API endpoints
│   ├── app.py              # Flask application
│   ├── config.py           # Configuration
│   └── requirements.txt
└── README.md
```

## 🔧 API Endpoints

### Sales Endpoints
- `GET /api/warehouse/sales/summary` - Sales summary with period filtering
- `GET /api/warehouse/sales/main` - Classic sales data
- `GET /api/warehouse/sales/chinese` - Chinese sales data
- `GET /api/warehouse/sales/main/top-products` - Top classic products
- `GET /api/warehouse/sales/chinese/top-products` - Top Chinese products
- `GET /api/warehouse/sales/main/customers` - Classic sales customers
- `GET /api/warehouse/sales/chinese/customers` - Chinese sales customers

### Warehouse Endpoints
- `GET /api/warehouse/classic` - Classic warehouse inventory
- `GET /api/warehouse/chinese` - Chinese warehouse inventory
- `GET /api/warehouse/scrap` - Scrap warehouse inventory

## 🌐 Features in Detail

### Multi-language Support
- **Arabic Interface** with full RTL support
- **English** for technical components
- **Bilingual** labels and descriptions

### Responsive Design
- **Mobile-first** approach
- **Tablet** optimized layouts
- **Desktop** full-featured interface

### Data Visualization
- **Interactive Charts** using Chart.js
- **Real-time Updates** with dynamic filtering
- **Export Capabilities** for reports

## 🔒 Security Features
- **Input Validation** on all forms
- **SQL Injection Protection** via SQLAlchemy
- **CORS Configuration** for secure API access
- **Error Handling** with user-friendly messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**NEWTEX** - Streamlining textile business operations with modern technology.

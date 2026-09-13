# CraftStock Inventory (inventory-core-36)

A full-stack inventory management system for small-batch producers, built with FastAPI + React.

## Architecture

- **Backend**: Python FastAPI with MongoDB (Motor async driver)
- **Frontend**: React 18 + TailwindCSS + shadcn/ui components
- **Database**: MongoDB

## Features

- **Products**: CRUD for raw materials and finished goods with stock tracking
- **Suppliers**: Manage supplier contacts and details
- **Purchase Orders**: Create, send, and receive POs with automatic stock adjustment
- **Recipes**: Define recipes with ingredient lists and yield quantities
- **Batch Production**: Run batches, deduct ingredients, credit output, track costs
- **Batch Reports**: Summarize production runs with per-recipe rollups
- **Dashboard**: KPI overview (stock value, low-stock alerts, pending POs)
- **Settings**: Company branding (name, color, currency)

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
# Set environment variables:
#   MONGO_URL=mongodb://localhost:27017
#   DB_NAME=craftstock
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend

```bash
cd frontend
npm install
# Set REACT_APP_BACKEND_URL in .env if backend is not at localhost
npm start
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/products | List all products |
| POST | /api/products | Create product |
| GET | /api/products/{id} | Get product |
| PUT | /api/products/{id} | Update product |
| DELETE | /api/products/{id} | Delete product |
| POST | /api/products/{id}/adjust | Adjust stock |
| GET | /api/suppliers | List suppliers |
| POST | /api/suppliers | Create supplier |
| PUT | /api/suppliers/{id} | Update supplier |
| DELETE | /api/suppliers/{id} | Delete supplier |
| GET | /api/purchase-orders | List POs |
| POST | /api/purchase-orders | Create PO |
| PATCH | /api/purchase-orders/{id}/status | Update PO status |
| POST | /api/purchase-orders/{id}/receive | Receive PO & add stock |
| DELETE | /api/purchase-orders/{id} | Delete PO |
| GET | /api/recipes | List recipes |
| POST | /api/recipes | Create recipe |
| PUT | /api/recipes/{id} | Update recipe |
| DELETE | /api/recipes/{id} | Delete recipe |
| POST | /api/recipes/{id}/produce | Run production batch |
| GET | /api/batch-runs | List batch runs |
| GET | /api/batch-runs/summary | Batch summary with per-recipe rollup |
| DELETE | /api/batch-runs/{id} | Delete batch run |
| GET | /api/dashboard/stats | Dashboard KPIs |
| GET | /api/settings | Get app settings |
| PUT | /api/settings | Update settings |
| POST | /api/seed | Seed sample data |

## Live Preview

https://inventory-core-36.preview.emergentagent.com/

## License

Private

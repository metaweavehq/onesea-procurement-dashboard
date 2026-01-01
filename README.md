# Procurement Dashboard

A comprehensive procurement analytics dashboard for SafeNet Fleet Management. Built with React, Express, and MySQL.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Color Schema](#color-schema)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Database Configuration](#database-configuration)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Vessels](#vessels)
  - [Fleet Overview](#fleet-overview)
  - [Requisitions](#requisitions)
  - [RFQ (Request for Quote)](#rfq-request-for-quote)
  - [Purchase Orders](#purchase-orders)
  - [Pipeline Analytics](#pipeline-analytics)
  - [Material/Service Split](#materialservice-split)
  - [Vessel-Specific Data](#vessel-specific-data)
- [AI Agent Usage Guide](#ai-agent-usage-guide)
  - [Common Agent Scenarios](#common-agent-scenarios)
  - [Query Building Reference](#query-building-reference)
  - [Response Interpretation Guide](#response-interpretation-guide)
  - [Best Practices for Agents](#best-practices-for-agents)

---

## Overview

This dashboard provides real-time procurement analytics for ship management operations, including:

- **Fleet Overview**: Total spend, PO counts, lead times across all vessels
- **Requisitions Tracking**: Status distribution, priority breakdown, critical items
- **RFQ Management**: Quote status, cycle times, vendor counts
- **Purchase Orders**: Spend tracking, status breakdown, overdue items
- **Pipeline Analytics**: Procurement funnel, bottlenecks, aging analysis

---

## Technology Stack

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.2.0 | UI framework |
| React DOM | 18.2.0 | React rendering |
| Recharts | 2.10.3 | Charts and data visualization |
| Tailwind CSS | 3.4.0 | Utility-first CSS framework |
| Vite | 5.0.10 | Build tool and dev server |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Express | 4.18.2 | Node.js web framework |
| MySQL2 | 3.6.5 | MySQL database driver |
| CORS | 2.8.5 | Cross-origin resource sharing |
| dotenv | 16.3.1 | Environment variable management |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @vitejs/plugin-react | 4.2.1 | React plugin for Vite |
| Autoprefixer | 10.4.16 | CSS vendor prefixing |
| PostCSS | 8.4.32 | CSS processing |
| Concurrently | 8.2.2 | Run multiple scripts |

---

## Color Schema

### Brand Colors (Onesea)
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| One Magenta | `#EC008C` | Primary brand color, active tabs, buttons |
| One Magenta Dark | `#C70076` | Hover states, emphasis |
| One Magenta Light | `#FF4DB8` | Highlights, accents |

### UI Colors (Tailwind Defaults)
| Color | Usage |
|-------|-------|
| `gray-50` to `gray-900` | Backgrounds, text, borders |
| `green-100/700` | Success states, delivered/approved |
| `yellow-100/700` | Warning states, pending items |
| `red-100/700` | Critical/cancelled states |
| `blue-100/700` | Info states, authorized |
| `purple-100/700` | Evaluated status |
| `orange-100/700` | Important priority (B) |

### KPI Card Color Variants
| Color | Icon Background | Usage |
|-------|-----------------|-------|
| `magenta` | `#EC008C` | Total counts, primary metrics |
| `yellow` | Yellow gradient | Pending/waiting items |
| `blue` | Blue gradient | In-progress items |
| `green` | Green gradient | Completed/approved items |
| `red` | Red gradient | Cancelled/critical items |

---

## Project Structure

```
procurement-dashboard/
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── index.html                  # Entry HTML file
│
├── server/                     # Backend API
│   ├── index.js               # Express server entry point (port 5007)
│   ├── db.js                  # MySQL connection pool & helpers
│   └── routes/
│       ├── vessels.js         # /api/vessels - Vessel list
│       ├── fleet.js           # /api/fleet - Fleet-wide KPIs
│       ├── requisitions.js    # /api/requisitions - Requisition data
│       ├── rfq.js             # /api/rfq - RFQ data
│       ├── purchase-orders.js # /api/purchase-orders - PO data
│       ├── pipeline.js        # /api/pipeline - Pipeline analytics
│       ├── material-service.js# /api/material-service - Material/Service split
│       └── vessel-procurement.js # /api/vessel/:shipId - Per-vessel data
│
└── src/                        # Frontend React application
    ├── main.jsx               # React entry point
    ├── App.jsx                # Main application component
    ├── index.css              # Global styles + Tailwind imports
    │
    └── components/
        ├── Header.jsx         # Top navigation with vessel/year selectors
        ├── DashboardTabs.jsx  # Tab navigation component
        ├── KPICard.jsx        # Reusable KPI display card
        ├── VesselSelector.jsx # Multi-vessel dropdown selector
        │
        ├── common/
        │   ├── FilterableTable.jsx  # Reusable table with filters
        │   └── Pagination.jsx       # Table pagination component
        │
        ├── fleet/
        │   ├── FleetOverview.jsx    # Fleet overview tab
        │   ├── MonthlySpendChart.jsx # Monthly spend line chart
        │   ├── SpendByVesselChart.jsx # Vessel spend bar chart
        │   └── POStatusBreakdown.jsx # PO status pie chart
        │
        ├── requisitions/
        │   └── RequisitionsTab.jsx  # Requisitions management tab
        │
        ├── rfq/
        │   └── RFQStatusTab.jsx     # RFQ status tab
        │
        ├── vessel/
        │   ├── VesselProcurement.jsx # Single vessel view
        │   ├── OpenOrdersTable.jsx   # Vessel PO table
        │   └── RequisitionStatus.jsx # Vessel requisition chart
        │
        ├── pipeline/
        │   ├── PipelineAnalysis.jsx  # Pipeline analytics tab
        │   ├── ProcurementFunnel.jsx # Funnel visualization
        │   ├── CycleTimeChart.jsx    # Cycle time metrics
        │   ├── BottleneckAlerts.jsx  # Alert cards
        │   └── AgingAnalysis.jsx     # PO aging chart
        │
        ├── analytics/
        │   └── AnalyticsTab.jsx     # Analytics dashboard tab
        │
        └── material-service/
            └── MaterialServiceAnalysis.jsx # Material vs Service breakdown
```

---

## Installation

```bash
# Clone or navigate to the project directory
cd procurement-dashboard

# Install dependencies
npm install
```

---

## Running the Application

### Development Mode (Frontend + Backend)
```bash
npm run dev:all
```
This starts:
- Frontend: http://localhost:3007 (Vite dev server)
- Backend: http://localhost:5007 (Express API)

### Frontend Only
```bash
npm run dev
```

### Backend Only
```bash
npm run dev:server
```

### Production Build
```bash
npm run build
npm run preview
```

---

## Database Configuration

The database connection supports both **Local MySQL** and **Cloud SQL** via environment variables.

### Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```bash
# For LOCAL MySQL (development):
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=safenet

# For CLOUD SQL via proxy (production):
# Start proxy first: ./cloud-sql-proxy lifeosai-481608:asia-south1:safenet-mysql --port=3308
DB_HOST=127.0.0.1
DB_PORT=3308
DB_USER=root
DB_PASSWORD=safenet123
DB_NAME=safenet

# Server port
PORT=5001
```

### Quick Setup

**Local MySQL:**
```bash
cp .env.example .env
# Edit .env: Set DB_PORT=3306 and DB_PASSWORD=
npm run dev:server
```

**Cloud SQL:**
```bash
# Terminal 1: Start the proxy
./cloud-sql-proxy lifeosai-481608:asia-south1:safenet-mysql --port=3308

# Terminal 2: Start the server (uses port 3308 by default if no .env)
npm run dev:server
```

### Default Behavior

Without a `.env` file, the server defaults to:
- **Host:** 127.0.0.1
- **Port:** 3308 (Cloud SQL proxy)
- **User:** root
- **Password:** safenet123
- **Database:** safenet

### Database Tables Used
| Table | Purpose |
|-------|---------|
| `ship` | Vessel master data |
| `rpt_po_status` | Purchase order status reporting |
| `rpt_po_delivery_item` | PO delivery tracking |
| `rpt_req_status` | Requisition status reporting |
| `rpt_rfq_status` | RFQ status reporting |
| `po_revision` | PO revision data with currency/exchange |
| `currency` | Currency master data |
| `lookup_value` | Status/priority code lookups |
| `requisition` | Requisition base table |
| `rfq` | RFQ base table |

---

## API Reference

**Base URL**: `http://localhost:5007/api`

All endpoints return JSON. Dates are in ISO 8601 format.

---

### Health Check

#### `GET /api/health`
Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### Vessels

#### `GET /api/vessels`
Get list of all vessels with procurement activity.

**Parameters:** None

**Response:**
```json
[
  {
    "SHIP_ID": 123,
    "NAME": "Brooklyn Bridge",
    "CODE": "BB01"
  }
]
```

---

### Fleet Overview

#### `GET /api/fleet/overview`
Get fleet-wide KPIs for procurement.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |

**Response:**
```json
{
  "year": 2025,
  "totalPOs": 1500,
  "totalSpendUSD": 5000000,
  "openPOs": 200,
  "avgLeadTimeDays": 45.5,
  "overdueItems": 50
}
```

---

#### `GET /api/fleet/monthly-spend`
Get monthly spend trend for the year.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |

**Response:**
```json
[
  {
    "month": 1,
    "monthName": "January",
    "poCount": 120,
    "spendUSD": 450000
  }
]
```

---

#### `GET /api/fleet/spend-by-vessel`
Get spend breakdown by vessel.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `limit` | integer | No | 15 | Max vessels to return |

**Response:**
```json
[
  {
    "shipId": 123,
    "vesselName": "Brooklyn Bridge",
    "poCount": 85,
    "spendUSD": 350000
  }
]
```

---

#### `GET /api/fleet/status-breakdown`
Get PO status distribution.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |

**Response:**
```json
[
  {
    "statusCode": 1090,
    "statusName": "CREATED",
    "count": 150,
    "spendUSD": 500000
  }
]
```

---

### Requisitions

#### `GET /api/requisitions/overview`
Get requisition KPI overview.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |

**Response:**
```json
{
  "year": 2025,
  "total": 9093,
  "pending": 936,
  "reviewed": 7017,
  "cancelled": 1140,
  "criticalItems": 232
}
```

---

#### `GET /api/requisitions/status-breakdown`
Get requisition status distribution.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |

**Response:**
```json
[
  {
    "status": "CREATED",
    "count": 487
  },
  {
    "status": "REVIEWED",
    "count": 7017
  }
]
```

---

#### `GET /api/requisitions/priority-breakdown`
Get requisition priority distribution.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |

**Response:**
```json
[
  {
    "priority": "A",
    "count": 23
  },
  {
    "priority": "D",
    "count": 6891
  }
]
```

---

#### `GET /api/requisitions/critical`
Get requisitions with critical items.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |
| `limit` | integer | No | 10000 | Max records to return |

**Response:**
```json
[
  {
    "req_number": "REQ-2025-001",
    "ship_name": "Brooklyn Bridge",
    "status": "CREATED",
    "priority": "A",
    "critical_count": 5,
    "item_count": 10,
    "date_created": "2025-01-15",
    "date_needed": "2025-02-01"
  }
]
```

---

#### `GET /api/requisitions/list`
Get full requisition list with filters.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |
| `status` | string | No | All | Filter by status (CREATED, AUTHORIZED, REVIEWED, CANCELLED) |
| `priority` | string | No | All | Filter by priority (A, B, C, D) |
| `limit` | integer | No | 10000 | Max records to return |

**Response:**
```json
[
  {
    "req_number": "REQ-2025-001",
    "ship_name": "Brooklyn Bridge",
    "status": "CREATED",
    "priority": "C",
    "critical_count": 0,
    "item_count": 5,
    "date_created": "2025-01-15",
    "date_needed": "2025-02-01"
  }
]
```

---

### RFQ (Request for Quote)

#### `GET /api/rfq/overview`
Get RFQ KPI overview.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |

**Response:**
```json
{
  "year": 2025,
  "total": 6728,
  "created": 1235,
  "inProgress": 78,
  "approved": 4810,
  "cancelled": 598,
  "awaitingQuotes": 445,
  "readyForPricing": 120
}
```

---

#### `GET /api/rfq/status-breakdown`
Get RFQ status distribution.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |

**Response:**
```json
[
  {
    "status": "APPROVED",
    "count": 4810
  },
  {
    "status": "CREATED",
    "count": 1235
  }
]
```

---

#### `GET /api/rfq/priority-breakdown`
Get RFQ priority distribution.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |

**Response:**
```json
[
  {
    "priority": "A",
    "count": 16
  },
  {
    "priority": "D",
    "count": 4798
  }
]
```

---

#### `GET /api/rfq/cycle-times`
Get average RFQ cycle times.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |

**Response:**
```json
{
  "issueToEvaluation": 21.5,
  "evaluationToApproval": 0.4
}
```

---

#### `GET /api/rfq/list`
Get full RFQ list with filters.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |
| `status` | string | No | All | Filter by status (CREATED, ISSUED, EVALUATED, APPROVED, CANCELLED) |
| `priority` | string | No | All | Filter by priority (A, B, C, D) |
| `limit` | integer | No | 10000 | Max records to return |

**Response:**
```json
[
  {
    "rfq_number": "000000707120",
    "title": "Motor, L.O. Priming Pump - No. 1 G/E",
    "ship_name": "ONE Humen",
    "status": "CREATED",
    "priority": "D",
    "vendor_count": 4,
    "days_to_evaluate": 0,
    "date_created": "2025-12-17",
    "date_issued": null,
    "date_approved": null
  }
]
```

---

### Purchase Orders

#### `GET /api/purchase-orders/overview`
Get PO KPI overview.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |

**Response:**
```json
{
  "year": 2025,
  "totalPOs": 1500,
  "totalSpendUSD": 5000000.50,
  "openPOs": 200,
  "delivered": 1100,
  "overdueItems": 50
}
```

---

#### `GET /api/purchase-orders/list`
Get full PO list.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |
| `shipIds` | string | No | All vessels | Comma-separated ship IDs |
| `limit` | integer | No | 10000 | Max records to return |

**Response:**
```json
[
  {
    "po_code": "PO-2025-001234",
    "title": "Engine Parts Order",
    "ship_name": "Brooklyn Bridge",
    "status": "ISSUED",
    "amount_usd": 15000.00,
    "date_created": "2025-01-15"
  }
]
```

---

### Pipeline Analytics

#### `GET /api/pipeline/funnel`
Get procurement funnel counts.

**Parameters:** None

**Response:**
```json
{
  "requisitions": 50000,
  "rfqs": 35000,
  "pos": 25000,
  "delivered": 20000,
  "closed": 18000
}
```

---

#### `GET /api/pipeline/cycle-times`
Get average cycle times for procurement stages.

**Parameters:** None

**Response:**
```json
{
  "createdToIssued": 5.5,
  "issuedToDelivered": 45.2,
  "issuedToReceived": 42.8,
  "createdToDelivered": 50.7
}
```

---

#### `GET /api/pipeline/bottlenecks`
Get bottleneck alerts.

**Parameters:** None

**Response:**
```json
{
  "alerts": [
    {
      "type": "stuck_created",
      "label": "POs stuck in Created (>30 days)",
      "count": 125,
      "severity": "warning"
    },
    {
      "type": "overdue",
      "label": "Overdue delivery items",
      "count": 50,
      "severity": "critical"
    }
  ]
}
```

---

#### `GET /api/pipeline/aging`
Get PO aging analysis.

**Parameters:** None

**Response:**
```json
[
  {
    "ageBucket": "0-7 days",
    "totalCount": 500,
    "openCount": 450
  },
  {
    "ageBucket": "60+ days",
    "totalCount": 2000,
    "openCount": 150
  }
]
```

---

### Material/Service Split

#### `GET /api/material-service/split`
Get material vs service spend breakdown.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Filter by year |

**Response:**
```json
{
  "year": 2025,
  "breakdown": [
    {
      "category": "Material",
      "poCount": 1200,
      "spendUSD": 4000000,
      "percentOfSpend": 80.0,
      "percentOfCount": 75.0
    },
    {
      "category": "Service",
      "poCount": 400,
      "spendUSD": 1000000,
      "percentOfSpend": 20.0,
      "percentOfCount": 25.0
    }
  ],
  "totals": {
    "totalSpendUSD": 5000000,
    "totalPOs": 1600
  }
}
```

---

### Vessel-Specific Data

#### `GET /api/vessel/:shipId/overview`
Get KPIs for a specific vessel.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `shipId` | integer | Yes | - | Ship ID (path parameter) |
| `year` | integer | No | Current year | Filter by year |

**Response:**
```json
{
  "shipId": 123,
  "year": 2025,
  "totalPOs": 85,
  "totalSpendUSD": 350000,
  "openPOs": 12,
  "delivered": 60,
  "closed": 55,
  "avgLeadTimeDays": 42.5,
  "overdueItems": 3
}
```

---

#### `GET /api/vessel/:shipId/open-orders`
Get POs for a specific vessel.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `shipId` | integer | Yes | - | Ship ID (path parameter) |
| `year` | integer | No | Current year | Filter by year |
| `limit` | integer | No | 100 | Max records (max: 500) |

**Response:**
```json
[
  {
    "id": 12345,
    "po_code": "PO-2025-001234",
    "title": "Engine Parts Order",
    "status": "ISSUED",
    "amount_usd": 15000,
    "date_created": "2025-01-15",
    "currency": "USD",
    "native_amount": 15000.00,
    "lead_time_days": 45
  }
]
```

---

## Status Code Reference

### PO Status Codes
| Code | Status |
|------|--------|
| 1090 | CREATED |
| 10910 | ISSUED |
| 10913 | DELIVERED |
| 10914 | ACKNOWLEDGED |
| 1095 | CLOSED |
| 1096 | CANCELLED |

### Requisition Status
| Status | Description |
|--------|-------------|
| CREATED | New requisition |
| AUTHORIZED | Approved by supervisor |
| REVIEWED | Completed review |
| CANCELLED | Cancelled |

### RFQ Status
| Status | Description |
|--------|-------------|
| CREATED | New RFQ |
| ISSUED | Sent to vendors |
| EVALUATED | Quotes evaluated |
| APPROVED | Vendor selected |
| CANCELLED | Cancelled |

### Priority Codes
| Code | Priority | Description |
|------|----------|-------------|
| A | Critical | Urgent, safety-critical |
| B | Important | High priority |
| C | Planned | Standard priority |
| D | Routine | Low priority |

---

## Usage Examples

### Get all RFQs for a specific vessel in 2025
```bash
curl "http://localhost:5007/api/rfq/list?year=2025&shipIds=123"
```

### Get fleet overview for multiple vessels
```bash
curl "http://localhost:5007/api/purchase-orders/overview?year=2025&shipIds=123,456,789"
```

### Get critical requisitions across all vessels
```bash
curl "http://localhost:5007/api/requisitions/critical?year=2025&limit=50"
```

### Filter RFQs by status and priority
```bash
curl "http://localhost:5007/api/rfq/list?year=2025&status=CREATED&priority=A"
```

---

## AI Agent Usage Guide

This section provides guidance for AI chat agents to effectively query the procurement API.

### Getting Started

**Base URL:** `http://localhost:5007/api`

**Step 1: Always start by getting the vessel list**
```bash
GET /api/vessels
```
This returns all available vessels with their `SHIP_ID` values needed for filtering.

**Step 2: Determine the year**
Most endpoints default to the current year. Always specify `year` parameter for historical data.

---

### Common Agent Scenarios

#### Scenario 1: "What is the procurement status for Brooklyn Bridge?"

**Step 1:** Get vessel ID
```bash
GET /api/vessels
# Find Brooklyn Bridge in response, note the SHIP_ID (e.g., 123)
```

**Step 2:** Get overview KPIs
```bash
GET /api/purchase-orders/overview?year=2025&shipIds=123
```

**Step 3:** Get detailed PO list if needed
```bash
GET /api/purchase-orders/list?year=2025&shipIds=123
```

---

#### Scenario 2: "Show me all critical requisitions"

```bash
GET /api/requisitions/critical?year=2025
```

Or filter by priority A (most critical):
```bash
GET /api/requisitions/list?year=2025&priority=A
```

---

#### Scenario 3: "What are the overdue items across the fleet?"

```bash
GET /api/purchase-orders/overview?year=2025
# Check the "overdueItems" field in response
```

For bottleneck details:
```bash
GET /api/pipeline/bottlenecks
# Returns alerts including overdue delivery items count
```

---

#### Scenario 4: "How much did we spend on vessel X this year?"

```bash
GET /api/vessel/{shipId}/overview?year=2025
# Returns totalSpendUSD for that specific vessel
```

Or for multiple vessels:
```bash
GET /api/purchase-orders/overview?year=2025&shipIds=123,456
```

---

#### Scenario 5: "What RFQs are pending approval?"

```bash
GET /api/rfq/list?year=2025&status=CREATED
```

Or for RFQs awaiting vendor quotes:
```bash
GET /api/rfq/overview?year=2025
# Check "awaitingQuotes" field
```

---

#### Scenario 6: "Compare procurement across multiple vessels"

```bash
GET /api/fleet/spend-by-vessel?year=2025&limit=10
# Returns top 10 vessels by spend
```

---

#### Scenario 7: "What's the average lead time for deliveries?"

```bash
GET /api/pipeline/cycle-times
# Returns createdToIssued, issuedToDelivered, etc.
```

Or for a specific vessel:
```bash
GET /api/vessel/{shipId}/overview?year=2025
# Check "avgLeadTimeDays" field
```

---

#### Scenario 8: "Show monthly spend trend"

```bash
GET /api/fleet/monthly-spend?year=2025
# Returns array with month, monthName, poCount, spendUSD
```

---

#### Scenario 9: "What's the material vs service split?"

```bash
GET /api/material-service/split?year=2025
# Returns breakdown by category with percentages
```

---

### Query Building Reference

#### Filter by Single Vessel
```
?shipIds=123
```

#### Filter by Multiple Vessels
```
?shipIds=123,456,789
```

#### Filter by Year
```
?year=2025
```

#### Filter by Status (Requisitions)
```
?status=CREATED
?status=AUTHORIZED
?status=REVIEWED
?status=CANCELLED
```

#### Filter by Status (RFQ)
```
?status=CREATED
?status=ISSUED
?status=EVALUATED
?status=APPROVED
?status=CANCELLED
```

#### Filter by Priority
```
?priority=A    # Critical
?priority=B    # Important
?priority=C    # Planned
?priority=D    # Routine
```

#### Limit Results
```
?limit=100
```

#### Combine Multiple Filters
```
?year=2025&shipIds=123,456&status=CREATED&priority=A&limit=50
```

---

### Response Interpretation Guide

#### KPI Overview Fields
| Field | Meaning |
|-------|---------|
| `totalPOs` | Total purchase orders count |
| `totalSpendUSD` | Total spend converted to USD |
| `openPOs` | POs not yet closed/delivered |
| `delivered` | Successfully delivered POs |
| `overdueItems` | Items past due date |
| `avgLeadTimeDays` | Average days from issue to delivery |

#### Status Meanings
| Status | What it means |
|--------|---------------|
| `CREATED` | New, not yet processed |
| `AUTHORIZED` | Supervisor approved |
| `ISSUED` | Sent to vendor |
| `EVALUATED` | Quotes received and reviewed |
| `APPROVED` | Final approval given |
| `DELIVERED` | Goods/services received |
| `CLOSED` | Fully completed |
| `CANCELLED` | Terminated |

#### Priority Interpretation
| Priority | Urgency | Typical Use |
|----------|---------|-------------|
| A | Critical | Safety items, urgent repairs |
| B | Important | High priority operational needs |
| C | Planned | Scheduled maintenance items |
| D | Routine | Standard replenishment |

---

### Best Practices for Agents

1. **Always get vessel list first** if user mentions a vessel name - you need the SHIP_ID
2. **Use overview endpoints first** for summary data, then drill down with list endpoints
3. **Specify year explicitly** to avoid confusion with default current year
4. **Use status filters** to narrow down results for specific questions
5. **Check bottlenecks endpoint** for alerts and issues requiring attention
6. **Limit large result sets** - use `limit` parameter for list endpoints

---

### Sample Agent Conversation Flow

**User:** "How many open POs does Brooklyn Bridge have?"

**Agent thought process:**
1. Need to find Brooklyn Bridge's SHIP_ID
2. Call `/api/vessels` to get the ID
3. Call `/api/purchase-orders/overview?year=2025&shipIds={id}`
4. Return the `openPOs` value from response

**User:** "Show me the details of those orders"

**Agent thought process:**
1. Already have the SHIP_ID from previous query
2. Call `/api/purchase-orders/list?year=2025&shipIds={id}`
3. Filter or summarize results as needed

---

## License

Proprietary - Onesea Ship Management

---

## Support

For issues or questions, contact the development team.

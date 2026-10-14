# 🛒 ShopPulse: Enterprise E-Commerce Big Data & Real-Time Analytics Platform

**ShopPulse** is a full-stack, enterprise Big Data analytics platform built specifically to analyze high-volume e-commerce datasets using **PySpark**, **MongoDB NoSQL**, **Python FastAPI**, and a modern **React + Vite** dashboard.

> **Project Version**: 3.2.0 | **Domain**: Big Data Analytics · E-Commerce · Real-Time Stream Processing

---

## � What's New in v3.2.0

- **Frontend Build Optimization**: Added production build configuration with Vite
- **Updated Dependencies**: React 19.2.8, Vite 8.3.0, Tailwind CSS 4.3.3, Recharts 3.10.1
- **Enhanced Tooling**: Added Oxlint for fast JavaScript/TypeScript linting
- **Improved Documentation**: Added production build instructions and deployment guidance
- **Build Artifacts**: Pre-optimized production bundle available in `frontend/dist/`

---

## �🎯 Why This Project Exists

Modern e-commerce businesses generate **terabytes of data daily** — clickstream events, purchase transactions, product reviews, and customer behaviour signals. Traditional databases and reporting tools cannot handle this scale. This project demonstrates how **Big Data technologies** solve real e-commerce problems:

| Problem | Big Data Solution Used |
|---|---|
| Millions of clickstream events — who is a real user vs bot? | **Bloom Filter** (O(1) probabilistic set membership) |
| Thousands of product reviews — what do customers really feel? | **MapReduce Word Count** (distributed text processing) |
| Which customers are the most valuable? | **RFM Segmentation** (PySpark DataFrame aggregations) |
| What products are bought together? | **Market Basket Analysis** (FP-Growth / Co-Purchase rules) |
| How do I store and query all this analytics output? | **MongoDB NoSQL** (schema-flexible document store) |
| How do I visualise and interact with all this data live? | **React Dashboard** with live FastAPI backend |

---

## 🛠️ Technology Stack & Architecture

### Big Data Processing Layer
- **PySpark 3.5.x** - Apache Spark's Python API for distributed data processing
  - DataFrames for batch ETL operations
  - RDDs for MapReduce text processing
  - Spark SQL for Hive-like analytical queries
  - MLlib for machine learning (FP-Growth market basket analysis)
  - Structured Streaming for real-time data processing

### NoSQL Database Layer
- **MongoDB** - Document-oriented NoSQL database
  - Stores analytics outputs as JSON documents
  - Supports flexible schema and fast indexed lookups
  - Automatic fallback to local JSON cache if MongoDB unavailable

### Backend API Layer
- **Python FastAPI** - Modern, high-performance web framework
  - REST API with 10+ interactive endpoints
  - Pydantic for data validation
  - Background task processing for pipeline triggers
  - CORS middleware for frontend integration
  - Live Bloom Filter instance with O(1) membership testing

### Frontend UI Layer
- **React 19.2.8** with **Vite 8.3.0** - Modern reactive UI framework with HMR
- **Tailwind CSS 4.3.3** - Utility-first styling framework with PostCSS
- **Recharts 3.10.1** - Declarative data visualization library
- **Lucide React 1.49.0** - Beautiful icon library
- **Oxlint 1.81.0** - Fast JavaScript/TypeScript linter

### Algorithms & Data Structures
- **Bloom Filter** - O(1) probabilistic set membership for real-time deduplication
- **MapReduce** - Distributed text processing paradigm
- **RFM Analysis** - Customer segmentation (Recency, Frequency, Monetary)
- **Market Basket Analysis** - Association rule mining for product recommendations

---

## 🏗️ System Architecture & Data Flow

```
[Raw Data Sources]
├── online_retail.csv (540K+ transactions)
├── reviews.json (5K+ product reviews)
└── clickstream.json (30K+ clickstream events)
         │
         ▼
[PySpark Processing Layer - spark/]
├── batch_etl.py              → Sales KPIs, RFM segmentation, country analytics
├── mapreduce_reviews.py      → Word frequency analysis from reviews
├── streaming_bloomfilter.py  → Real-time deduplication & bot detection
└── ml_recommendation.py      → Market basket association rules
         │
         ▼
[MongoDB NoSQL Store - db/mongo_manager.py]
├── batch_analytics collection
├── review_wordcount collection
├── realtime_bloomfilter collection
└── market_basket_rules collection
         │
         ▼
[FastAPI REST Backend - backend/app.py]
├── /api/analytics/summary
├── /api/bloom/check
├── /api/stream/simulate
├── /api/orders/create
├── /api/reviews/add
└── /api/pipeline/trigger
         │
         ▼
[React Dashboard - frontend/src/App.jsx]
├── 7 interactive tabs
├── 15+ data visualizations
└── Real-time auto-refresh (8s interval)
```

---

## 🎓 Big Data Concepts & Feature Mapping

| Syllabus Experiment | Implementation in ShopPulse |
|---|---|
| Exp 1 — Hadoop Ecosystem & HDFS file operations | Data stored in `/data/` directory, processed by PySpark local mode |
| Exp 2 — MapReduce Word Count | `spark/mapreduce_reviews.py` — RDD-based word count on 5,000 product reviews |
| Exp 3 — MongoDB NoSQL Configuration & Commands | `db/mongo_manager.py` — PyMongo connection, collection creation, insert_many, aggregation |
| Exp 4 — Hive Query Language | Simulated via PySpark SQL `spark.sql()` and `groupBy().agg()` in `batch_etl.py` |
| Exp 5 — Pig Script Data Analysis | Simulated via PySpark RDD transformations (map, filter, reduceByKey) |
| Exp 6 — Bloom Filter Streaming | `spark/streaming_bloomfilter.py` — 30K events, SHA-256 hashing, O(1) membership |
| Exp 7 — Data Visualization | Interactive React + Recharts dashboard (modern web-based visualisation) |
| Exp 8 — Big Data Tool for Data Analysis | Full platform: PySpark + MongoDB + FastAPI + React — end-to-end analytics system |

---

## � Dashboard Features (7 Interactive Tabs)

### Tab 1 — Dashboard Overview
**Purpose**: Central command centre showing real-time platform health and KPIs

**Features**:
- 4 live KPI cards: Total Revenue, Unique Visitors (Bloom Filter), Threats Blocked, Recommendation Rules
- Monthly revenue trend area chart (12-month aggregation from PySpark ETL)
- Sales conversion funnel visualization (Page Views → Search → Add to Cart → Checkout → Purchase)
- PySpark pipeline health status (Batch ETL, MapReduce, Bloom Filter, ML Engine)
- One-click "Run Data Pipeline" button to re-trigger all PySpark jobs
- Auto-refreshing event counter (every 8 seconds)
- Quick stats panel: Countries Served, Customer Segments, Review Keywords, Top Products

**Big Data Concept**: Real-time dashboard pattern — aggregating outputs from multiple distributed analytics jobs into one unified view. Mirrors tools like Apache Ambari, Grafana, and Databricks Lakehouse dashboards.

---

### Tab 2 — Sales & Revenue Analytics
**Purpose**: Deep-dive analytics module for e-commerce transaction data

**Features**:
- Interactive country/region filter dropdown
- Revenue by Region bar chart (PySpark groupBy aggregation on 540K rows)
- Monthly Revenue Trend area chart with gradient fill
- Sales Conversion Funnel chart showing customer journey drop-off at each stage
- Top Performing Products table (sorted by total revenue with stock code, description, units sold)

**Big Data Concept**: PySpark DataFrame Batch ETL — reads the 540K-row Online Retail CSV, applies groupBy().agg() transformations, and writes aggregated output to MongoDB. Equivalent to a Hive query or Pig script on HDFS data.

---

### Tab 3 — Traffic & Threat Simulator (Bloom Filter)
**Purpose**: Interactive real-time stream processor using Bloom Filter for duplicate detection and bot filtering

**Features**:
- 3 simulation modes:
  - **Normal Traffic** — mixed events from random USER IDs
  - **Purchase Surge** — simulates a flash sale with high purchase frequency
  - **Bot Attack** — injects BOT IDs to demonstrate interception
- Bloom Filter Membership Tester — type any User ID or IP for instant O(1) lookup
- Clickable Sample IDs — pre-seeded real user IDs and bot IDs for quick testing
- Live Event Stream Feed — shows last 15 events with timestamps and status
- 4 live stream counters: Total Events, Unique Visitors, Duplicates Blocked, Bot Threats
- Stream History Area Chart — plots unique vs duplicate counts over simulation batches
- False Positive Rate displayed live

**Big Data Concept**: Bloom Filter Streaming Algorithm — processes 30,000 clickstream events, builds a bit-array of size 20,000 using 4 SHA-256 hash functions, achieves sub-millisecond membership testing. Equivalent to Apache Kafka + Flink real-time deduplication.

---

### Tab 4 — Review Intelligence (MapReduce)
**Purpose**: Sentiment analysis and keyphrase frequency engine using MapReduce paradigm

**Features**:
- Sentiment filter buttons (All/Positive/Neutral/Negative)
- Keyword search bar across all review data
- Sentiment Keyphrase Frequency Pills — color-coded word/count badges
- Sentiment Distribution Pie Chart (Positive:Neutral:Negative ratio)
- Top 10 Keywords Bar Chart (highest-frequency sentiment words)
- Word count statistics (total terms extracted, filtered count)
- Keyphrase Cloud visualization with sentiment-based coloring

**Big Data Concept**: PySpark RDD MapReduce — implements map → shuffle → reduce pipeline: maps each review word to (word, 1), filters stopwords, groups by sentiment, reduces to (word, total_count). Same algorithm as Hadoop MapReduce word count.

---

### Tab 5 — Customer Cohorts (RFM Segmentation)
**Purpose**: Customer intelligence module using RFM analysis (Recency, Frequency, Monetary)

**Features**:
- Cohort Group filter dropdown (VIP Champions, Loyal Customers, Potential Loyalists, At Risk/New)
- Customer ID search bar
- Customer Value Matrix table (order frequency, monetary spend, cohort label)
- View Profile button with modal showing full customer details and marketing recommendations
- Segment Distribution Pie Chart (percentage of customers per cohort)
- Customer Value Scatter Plot (Frequency vs Monetary to identify VIP clusters)
- Top 10 Customers Bar Chart (ranked by total spend)

**Big Data Concept**: PySpark DataFrame RFM Aggregation — groups 540K+ transactions by CustomerID, computes COUNT(InvoiceNo) and SUM(Quantity × UnitPrice), then applies threshold segmentation. Equivalent to a Hive analytical query on a data warehouse.

---

### Tab 6 — Product Recommendations (Market Basket)
**Purpose**: Co-purchase recommendation engine mining association rules from transaction history

**Features**:
- Product filter dropdown (select any product to see its pairings)
- Confidence threshold slider (filter rules by minimum confidence %)
- Recommendation cards showing Product A → Product B with co-purchase count and confidence
- Association Rule counter (live count matching current filters)
- Confidence bars (visual indicator of rule strength)
- Interactive grid layout for rule exploration

**Big Data Concept**: PySpark Co-Purchase Market Basket Analysis — uses DataFrame.join() to find invoice pairs sharing the same transaction, then aggregates co-occurrence counts. Mirrors FP-Growth and Apriori algorithms. Equivalent to Pig COGROUP script for association rule mining.

---

### Tab 7 — Data Ingestion Lab
**Purpose**: Interactive ETL control panel for injecting new data into the live analytics pipeline

**Features**:
- Create Custom Order form (Country, Customer ID, Stock Code, Description, Quantity, Unit Price)
- Submit Customer Review form (Product ID, User ID, Rating, Sentiment, Review Text)
- Pipeline Status Board (real-time status of PySpark ETL, MapReduce, Bloom Filter, ML jobs)
- Ingestion Activity Log (scrolling log of all form submissions and pipeline triggers)
- One-click "Run Full Pipeline" button (re-runs all 4 PySpark jobs from scratch)
- Real-time calculation of order totals
- Quick review text templates for testing

**Big Data Concept**: NoSQL MongoDB Data Ingestion + End-to-End Pipeline Orchestration — demonstrates reading from MongoDB collections, writing new documents, triggering downstream PySpark jobs. Equivalent to Apache NiFi or Kafka Connect in a production data lake. Demonstrates the Lambda Architecture: batch layer (PySpark ETL) + speed layer (real-time Bloom Filter API).

---

## 📦 Production Build

The project includes an optimized production build of the React frontend located in `frontend/dist/`. This build is:

- **Minified & Optimized**: JavaScript and CSS are minified for faster loading
- **Tree-shaken**: Unused code is removed automatically
- **Asset Hashed**: Files include content hashes for cache busting
- **Ready for Deployment**: Can be served by any static web server (Nginx, Apache, Cloudflare, etc.)

To rebuild the production bundle:
```bash
cd frontend
npm run build
```

To preview the production build locally:
```bash
cd frontend
npm run preview
```

---

## 🚀 How to Run the Project

### Option A: 1-Click Execution (Windows)
Double-click `run_project.bat` or run in terminal:
```cmd
run_project.bat
```

### Option B: Manual Execution

> ⚠️ **IMPORTANT**: All commands below must be run from the **project root directory** (`e:\projects\ecommerce-bigdata-analytics`), NOT from any subdirectory.

1. **Step 1: Download Real Datasets & Setup Engine**
```bash
# Run from: e:\projects\ecommerce-bigdata-analytics\
python data/download_datasets.py
python spark/mapreduce_reviews.py
python spark/batch_etl.py
python spark/streaming_bloomfilter.py
python spark/ml_recommendation.py
```

2. **Step 2: Sync to MongoDB NoSQL Store**
```bash
# Run from: e:\projects\ecommerce-bigdata-analytics\
python db/mongo_manager.py
```

3. **Step 3: Start Python FastAPI REST Backend**
```bash
# Run from: e:\projects\ecommerce-bigdata-analytics\   ← MUST be project root!
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```
*API Swagger Docs:* [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

> ❌ **Common mistake**: Running `python -m uvicorn backend.app:app` from inside the `backend/` folder causes `ModuleNotFoundError: No module named 'backend'`. Always run from the project root.

4. **Step 4: Launch React Analytics Dashboard**

**Option A: Development Mode (Recommended for development)**
```bash
# Run from: e:\projects\ecommerce-bigdata-analytics\frontend\
cd frontend
npm run dev
```
*Open Browser:* [http://localhost:5173](http://localhost:5173) *(or 5174 if 5173 is already in use)*

**Option B: Production Build (Pre-built available)**
```bash
# Run from: e:\projects\ecommerce-bigdata-analytics\frontend\
cd frontend
npm run build
npm run preview
```
*Open Browser:* [http://localhost:4173](http://localhost:4173)

> 📦 **Note**: A production build is already available in `frontend/dist/`. You can serve it with any static file server, or use `npm run preview` to test the optimized build.

---

## � API Endpoints

The FastAPI backend provides the following REST endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | API status and feature list |
| `/api/health` | GET | Health check with MongoDB status and Bloom Filter item count |
| `/api/analytics/summary` | GET | Returns all analytics data (country_analytics, top_products, rfm_segmentation, wordcount, bloom_filter, market_basket) |
| `/api/bloom/sample-ids` | GET | Returns sample user IDs, IPs, and bot IDs for testing |
| `/api/bloom/check` | POST | Bloom Filter membership test (JSON body: `{"identifier": "USER-101"}`) |
| `/api/stream/simulate` | POST | Simulate traffic injection (query params: `count`, `mode`) |
| `/api/orders/create` | POST | Create custom order and trigger ETL pipeline |
| `/api/reviews/add` | POST | Submit customer review and trigger MapReduce re-analysis |
| `/api/pipeline/trigger` | POST | Trigger full PySpark pipeline (all 4 jobs) |

**Interactive API Documentation**: Once the backend is running, visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for Swagger UI with interactive endpoint testing.

---

## 📁 Project Structure

```
ecommerce-bigdata-analytics/
├── data/                       # Raw datasets and processed outputs
│   ├── online_retail.csv       # 540K+ transaction records
│   ├── reviews.json            # 5K+ product reviews
│   ├── clickstream.json        # 30K+ clickstream events
│   ├── batch_etl_output.json   # Sales KPIs, RFM segmentation output
│   ├── wordcount_output.json   # MapReduce word frequency output
│   ├── streaming_bloomfilter_output.json  # Bloom filter stats
│   ├── ml_recommendation_output.json       # Market basket rules
│   └── download_datasets.py    # Dataset downloader
├── spark/                      # PySpark processing scripts
│   ├── batch_etl.py            # Sales analytics, RFM, country aggregations
│   ├── mapreduce_reviews.py    # RDD MapReduce for review text analysis
│   ├── streaming_bloomfilter.py # Bloom filter implementation & stream processing
│   └── ml_recommendation.py    # Market basket analysis (FP-Growth)
├── db/                         # MongoDB database layer
│   └── mongo_manager.py        # MongoDB connection, sync, aggregation
├── backend/                    # Python REST API
│   └── app.py                  # FastAPI application with 10+ endpoints
├── frontend/                   # React Frontend (Vite + Tailwind CSS + Recharts)
│   ├── src/
│   │   ├── App.jsx             # Main React component with 7 tabs
│   │   └── main.jsx            # React entry point
│   ├── package.json            # Frontend dependencies (v3.2.0)
│   ├── vite.config.js          # Vite build configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   ├── index.html              # HTML entry point
│   └── dist/                   # Production build output (optimized bundle)
├── README.md                   # This file
├── FEATURES_EXPLAINED.md       # Detailed feature documentation
├── PROJECT_PLAN.md             # Project architecture and execution plan
└── run_project.bat             # Windows 1-click execution script
```

---

## �🐛 Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `ModuleNotFoundError: No module named 'backend'` | Running uvicorn from wrong directory | Run from project root, not from `backend/` folder |
| `Failed to fetch` in browser | Backend not running | Start backend with Step 3 above |
| Port 5173 already in use | Old Vite process still running | Vite auto-picks 5174 — open that URL instead |
| MongoDB not connected | MongoDB service not running | App falls back to local JSON cache automatically |


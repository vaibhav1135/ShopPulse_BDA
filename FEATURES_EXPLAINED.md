# 📖 ShopPulse — Feature & Tab Documentation

> **Project**: ShopPulse E-Commerce Big Data Analytics Platform
> **Stack**: PySpark · MongoDB · Python (FastAPI) · React (Vite) · Recharts
> **Domain**: Big Data Analytics · E-Commerce · Real-Time Stream Processing

---

## 🧭 Why This Project Exists

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

## 🗂️ Tab 1 — Dashboard Overview

### What It Is
A **central command centre** showing the real-time health and KPIs of the entire analytics platform. It is the first screen you see when you open the app.

### Why It Is Needed
In any production big data system, engineers and analysts need a **single pane of glass** to monitor:
- How much data has been processed
- Whether the pipeline is healthy
- Key business metrics at a glance without navigating to each section

### What It Does
- Displays **4 live KPI cards**: Total Revenue, Unique Visitors (Bloom), Duplicate Intercepts, and Recommendation Rules
- Shows a **monthly revenue trend** area chart (last 12 months of e-commerce sales)
- Shows a **system health panel** for the pipeline components: PySpark ETL, Bloom Filter, MapReduce, ML Engine
- Contains a **one-click "Run Data Pipeline"** button that re-triggers all PySpark jobs
- Shows **live event stream counter** that updates every 8 seconds automatically

### Big Data Concept Demonstrated
**Real-time dashboard pattern** — aggregating outputs from multiple distributed analytics jobs into one unified view. This mirrors tools like **Apache Ambari**, **Grafana**, and **Databricks Lakehouse** dashboards.

---

## 🗂️ Tab 2 — Sales & Revenue Analytics

### What It Is
A **deep-dive analytics module** for e-commerce transaction data — region-wise revenue breakdown, product performance, and the sales conversion funnel.

### Why It Is Needed
Retail analysts constantly need to answer: "Which countries drive the most revenue?", "What are our top-selling products?", "Where in the purchase funnel are customers dropping off?" Without big data processing, analysing 540,000+ transaction rows would be too slow for a traditional SQL database at query time.

### What It Does
- **Interactive country/region filter** — select any region to isolate its metrics
- **Revenue by Region bar chart** — visualises SUM(Quantity × UnitPrice) grouped by country via PySpark aggregation
- **Monthly Revenue Trend** (Area chart) — shows revenue over time with gradient fill
- **Sales Conversion Funnel** — shows the customer journey: Page Views → Search → Add to Cart → Checkout → Purchase with drop-off at each stage
- **Top Performing Products table** — sorted by TotalRevenue with stock code, description, units sold

### Big Data Concept Demonstrated
**PySpark DataFrame Batch ETL** — reads the 540K-row Online Retail CSV, applies groupBy().agg() transformations, and writes aggregated output to MongoDB. Equivalent to a **Hive query** or **Pig script** on HDFS data.

---

## 🗂️ Tab 3 — Traffic & Threat Simulator (Bloom Filter)

### What It Is
An **interactive real-time stream processor** that uses the **Bloom Filter probabilistic data structure** to detect duplicate visitors, returning users, and bot traffic in O(1) constant time.

### Why It Is Needed
E-commerce sites get hit by:
- **Bot traffic** that inflates page view counts and skews analytics
- **Duplicate events** from the same user refreshing a page
- **DDoS-style traffic attacks** from a small pool of IPs

Checking a 60,000-user database for every single event would be too slow. A Bloom Filter stores a **compressed bit-array representation** of all known user IDs and checks membership in **constant O(1) time** regardless of dataset size.

### What It Does
- **3 simulation modes**:
  - Normal Traffic — mixed events from random USER IDs
  - Purchase Surge — simulates a flash sale with high purchase frequency
  - Bot Attack — injects BOT IDs to demonstrate interception
- **Bloom Filter Membership Tester** — type any User ID or IP and get instant result
- **Clickable Sample IDs** — pre-seeded real user IDs and bot IDs for quick testing
- **Live Stream Event Feed** — shows last 15 events with timestamps and status
- **4 live stream counters** — Total Events, Unique Visitors, Duplicates Blocked, Bot Threats
- **Stream History Area Chart** — plots unique vs duplicate counts over simulation batches
- **False Positive Rate** displayed live

### Big Data Concept Demonstrated
**Bloom Filter Streaming Algorithm** (Syllabus Experiment 6) — processes 30,000 clickstream events, builds a bit-array of size 20,000 using 4 SHA-256 hash functions, achieves sub-millisecond membership testing. Equivalent to Apache Kafka + Flink real-time deduplication.

---

## 🗂️ Tab 4 — Review Intelligence (MapReduce)

### What It Is
A **sentiment analysis and keyphrase frequency engine** that processes thousands of customer reviews using the **MapReduce paradigm** to extract meaningful words associated with positive, neutral, and negative experiences.

### Why It Is Needed
Amazon, Flipkart, and other e-commerce platforms process **millions of product reviews**. MapReduce distributes text processing across many worker nodes — each processes its chunk, then a reducer merges all counts globally.

### What It Does
- **Sentiment filter buttons** — toggle between All / Positive / Neutral / Negative
- **Keyword search bar** — search for any keyphrase across all review data
- **Sentiment Keyphrase Frequency Pills** — colour-coded word/count badges
- **Sentiment Distribution Pie Chart** — shows Positive:Neutral:Negative ratio
- **Top 10 Keywords Bar Chart** — highest-frequency sentiment words
- **Word count stats** — total terms extracted and filtered count

### Big Data Concept Demonstrated
**PySpark RDD MapReduce** (Syllabus Experiment 2) — implements map → shuffle → reduce pipeline: maps each review word to (word, 1), filters stopwords, groups by sentiment, reduces to (word, total_count). Same algorithm as Hadoop MapReduce word count.

---

## 🗂️ Tab 5 — Customer Cohorts (RFM Segmentation)

### What It Is
A **customer intelligence module** that segments all customers into value-based cohorts using **RFM analysis** (Recency, Frequency, Monetary).

### Why It Is Needed
Not all customers are equal. A business should target marketing at customers most likely to buy again. RFM gives **data-driven segmentation** using pure aggregation math on transaction history at PySpark scale.

### What It Does
- **Cohort Group filter dropdown** — filter by segment type
- **Customer ID search bar** — find any specific customer
- **Customer Value Matrix table** — order frequency, monetary spend, cohort label
- **View Profile button** — modal with full customer details
- **Segment Distribution Pie Chart** — percentage of customers per cohort
- **Customer Value Scatter Plot** — Frequency vs Monetary Value scatter to identify VIP clusters
- **Top 10 Customers Bar Chart** — ranked by total spend

### Big Data Concept Demonstrated
**PySpark DataFrame RFM Aggregation** — groups 540K+ transactions by CustomerID, computes COUNT(InvoiceNo) and SUM(Quantity × UnitPrice), then applies threshold segmentation. Equivalent to a **Hive analytical query** on a data warehouse.

---

## 🗂️ Tab 6 — Product Recommendations (Market Basket)

### What It Is
A **co-purchase recommendation engine** that mines association rules from transaction history, discovering which products are frequently bought together.

### Why It Is Needed
Amazon's recommendation engine drives ~35% of total revenue. By discovering product associations in transaction logs, platforms can increase average order value through cross-selling and upselling.

### What It Does
- **Product filter dropdown** — select any product to see its pairings
- **Confidence threshold slider** — filter rules by minimum confidence %
- **Recommendation cards** — Product A → Product B with co-purchase count and confidence
- **Association Rule counter** — live count matching current filters
- **Confidence bars** — visual indicator of rule strength

### Big Data Concept Demonstrated
**PySpark Co-Purchase Market Basket Analysis** — uses DataFrame.join() to find invoice pairs sharing the same transaction, then aggregates co-occurrence counts. Mirrors FP-Growth and Apriori algorithms. Equivalent to **Pig COGROUP** script for association rule mining.

---

## 🗂️ Tab 7 — Data Ingestion Lab

### What It Is
An **interactive ETL control panel** that lets users inject new data directly into the live analytics pipeline — simulating real e-commerce systems ingesting orders and reviews in real time and immediately re-processing analytics.

### Why It Is Needed
A static dashboard with fixed data does not demonstrate a **live big data system**. When you add a new order, it:
1. Appends to the raw CSV dataset
2. Triggers PySpark batch ETL in the background
3. Syncs results to MongoDB
4. Refreshes the dashboard with updated KPIs

This demonstrates the **Lambda Architecture**: batch layer (PySpark ETL) + speed layer (real-time Bloom Filter API).

### What It Does
- **Create Custom Order form** — Country, Customer ID, Stock Code, Description, Quantity, Unit Price
- **Submit Customer Review form** — Product ID, User ID, Rating, Sentiment, Review Text
- **Pipeline Status Board** — real-time status of PySpark ETL, MapReduce, Bloom Filter, ML jobs
- **Ingestion Activity Log** — scrolling log of all form submissions and pipeline triggers
- **One-click "Run Full Pipeline"** — re-runs all 4 PySpark jobs from scratch

### Big Data Concept Demonstrated
**NoSQL MongoDB Data Ingestion** (Syllabus Experiment 3) + **End-to-End Pipeline Orchestration** (Syllabus Experiment 8). Demonstrates reading from MongoDB collections, writing new documents, triggering downstream PySpark jobs — equivalent to Apache NiFi or Kafka Connect in a production data lake.

---

## 🔧 Technology Mapping to Syllabus

| Syllabus Experiment | Implementation in ShopPulse |
|---|---|
| Exp 1 — Hadoop Ecosystem & HDFS file operations | Data stored in /data/ directory, processed by PySpark local mode |
| Exp 2 — MapReduce Word Count | spark/mapreduce_reviews.py — RDD-based word count on 5,000 product reviews |
| Exp 3 — MongoDB NoSQL Configuration & Commands | db/mongo_manager.py — PyMongo connection, collection creation, insert_many, aggregation |
| Exp 4 — Hive Query Language | Simulated via PySpark SQL spark.sql() and groupBy().agg() in batch_etl.py |
| Exp 5 — Pig Script Data Analysis | Simulated via PySpark RDD transformations (map, filter, reduceByKey) |
| Exp 6 — Bloom Filter Streaming | spark/streaming_bloomfilter.py — 30K events, SHA-256 hashing, O(1) membership |
| Exp 7 — Data Visualization | Interactive React + Recharts dashboard (modern web-based visualisation) |
| Exp 8 — Big Data Tool for Data Analysis | Full platform: PySpark + MongoDB + FastAPI + React — end-to-end analytics system |

---

## 🏗️ Architecture Summary

```
[Raw Data: 540K rows Online Retail CSV + 5K Reviews JSON + 30K Clickstream JSON]
                              |
              [PySpark Processing Layer - spark/]
         +-------------------------------------------------+
         |  batch_etl.py          -> Sales KPIs, RFM       |
         |  mapreduce_reviews.py  -> Word Frequency         |
         |  streaming_bloomfilter.py -> Dedup/Bot Detection |
         |  ml_recommendation.py  -> Market Basket Rules    |
         +-------------------------------------------------+
                              |
         [MongoDB NoSQL Store (shoppulse_bigdata DB)]
         [JSON Document Cache (fallback if no Mongo)]
                              |
           [FastAPI REST Backend - backend/app.py]
           (10 interactive API endpoints, live simulation)
                              |
            [React Frontend - frontend/src/App.jsx]
           (7 tabs, 15+ charts, real-time auto-refresh)
```

---

*Documentation for ShopPulse v3.1.0 — Big Data Analytics Capstone Project*


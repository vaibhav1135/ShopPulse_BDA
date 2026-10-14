@echo off
echo ======================================================================
echo           ShopPulse: E-Commerce Big Data Analytics Platform
echo ======================================================================
echo Version: 3.2.0 | Tech Stack: PySpark | MongoDB | FastAPI | React Vite
echo ======================================================================

echo.
echo [Step 1/4] Ensuring Data Setup & PySpark Aggregations...
python data\download_datasets.py
python spark\mapreduce_reviews.py
python spark\batch_etl.py
python spark\streaming_bloomfilter.py
python spark\ml_recommendation.py

echo.
echo [Step 2/4] Indexing PySpark outputs into MongoDB NoSQL...
python db\mongo_manager.py

echo.
echo [Step 3/4] Starting Python FastAPI REST API Backend on http://127.0.0.1:8000...
start /b python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000

echo.
echo [Step 4/4] Starting React Analytics Dashboard UI on http://localhost:5173...
cd frontend
npm run dev

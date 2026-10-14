import os
import sys
import json
import random
import subprocess
from datetime import datetime
from fastapi import FastAPI, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.mongo_manager import MongoDataManager
from spark.streaming_bloomfilter import BloomFilter

app = FastAPI(
    title="ShopPulse Enterprise Control Center API",
    description="Full Interactive REST API for PySpark, MongoDB, and Real-Time Analytics",
    version="3.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_manager = MongoDataManager()

# Global in-memory Bloom Filter instance
global_bloom_filter = BloomFilter(size=30000, num_hashes=4)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
clickstream_path = os.path.join(DATA_DIR, "clickstream.json")
bloom_output_path = os.path.join(DATA_DIR, "streaming_bloomfilter_output.json")

sample_user_ids = ["USER-101", "USER-105", "USER-220", "USER-350", "BOT-1", "BOT-2"]
sample_ips = ["192.168.1.10", "192.168.1.15", "10.0.0.1", "10.0.0.2"]

# Accumulated stream counters
stream_stats = {
    "total_events": 30000,
    "unique_visitors": 406,
    "duplicates_blocked": 29594,
    "bot_threats": 4200
}

# Pre-populate Bloom Filter with clickstream data on startup
if os.path.exists(clickstream_path):
    try:
        with open(clickstream_path, "r", encoding="utf-8") as f:
            cdata = json.load(f)
            seen_items = set()
            for evt in cdata:
                uid = evt.get("user_id")
                ip = evt.get("ip_address")
                if uid and uid not in seen_items:
                    seen_items.add(uid)
                    global_bloom_filter.add(uid)
                if ip and ip not in seen_items:
                    seen_items.add(ip)
                    global_bloom_filter.add(ip)
        print(f"[Bloom Filter API] Pre-loaded {global_bloom_filter.item_count} unique items into Bloom Filter!")
    except Exception as e:
        print(f"[Bloom Filter Warning] Failed to preload clickstreams: {e}")

class BloomCheckRequest(BaseModel):
    identifier: str

class CustomOrderRequest(BaseModel):
    country: str
    stock_code: str
    description: str
    quantity: int
    unit_price: float
    customer_id: str

class CustomReviewRequest(BaseModel):
    product_id: str
    user_id: str
    rating: int
    sentiment: str
    review_text: str

def sync_bloom_stats_file():
    """Writes updated Bloom Filter stream metrics to JSON and syncs with MongoDB"""
    output_data = {
        "summary": {
            "total_events_processed": stream_stats["total_events"],
            "unique_visitors_bloomfilter": stream_stats["unique_visitors"],
            "actual_unique_visitors": stream_stats["unique_visitors"],
            "duplicate_events_filtered": stream_stats["duplicates_blocked"],
            "bot_threats_blocked": stream_stats["bot_threats"],
            "bloom_filter_size_bits": global_bloom_filter.size,
            "estimated_fp_rate_pct": round(global_bloom_filter.false_positive_rate() * 100, 4)
        }
    }
    with open(bloom_output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)
        
    db_manager.sync_spark_outputs_to_db()

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "service": "ShopPulse E-Commerce Big Data Control Center",
        "interactive_features": [
            "Interactive Left Sidebar Navigation",
            "1-Click Bloom Filter Membership Testing",
            "Real-Time Stream & Threat Simulator",
            "Live Custom Order Generator",
            "Live Product Review Ingestion Engine"
        ]
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "MongoDB Connected" if db_manager.use_mongo else "Document Cache Active",
        "bloom_items": global_bloom_filter.item_count
    }

@app.get("/api/analytics/summary")
def get_analytics_summary():
    return db_manager.get_dashboard_summary()

@app.get("/api/bloom/sample-ids")
def get_sample_bloom_ids():
    return {
        "sample_user_ids": sample_user_ids,
        "sample_ips": sample_ips,
        "sample_bot_ids": ["BOT-1", "BOT-2", "BOT-3", "10.0.0.1"]
    }

@app.post("/api/bloom/check")
def check_bloom_filter(req: BloomCheckRequest):
    identifier = req.identifier.strip()
    might_exist = global_bloom_filter.might_contain(identifier)
    return {
        "identifier": identifier,
        "might_exist": might_exist,
        "false_positive_rate_pct": round(global_bloom_filter.false_positive_rate() * 100, 4),
        "total_items_in_filter": global_bloom_filter.item_count
    }

@app.post("/api/stream/simulate")
def simulate_traffic(count: int = Query(100), mode: str = Query("normal")):
    events_generated = []
    bot_count = 0
    duplicate_count = 0
    new_visitors = 0
    
    for i in range(count):
        if mode == "bot_attack":
            ip = f"10.0.0.{random.randint(1, 3)}"
            user_id = f"BOT-{random.randint(1, 4)}"
            event_type = "page_view"
        elif mode == "purchase_surge":
            ip = f"192.168.1.{random.randint(10, 80)}"
            user_id = f"USER-{random.randint(100, 500)}"
            event_type = "purchase"
        else:
            ip = f"192.168.1.{random.randint(10, 50)}"
            user_id = f"USER-{random.randint(100, 400)}"
            event_type = random.choice(["page_view", "search", "add_to_cart", "checkout", "purchase"])

        is_dup = global_bloom_filter.might_contain(user_id)
        if is_dup:
            duplicate_count += 1
            if user_id.startswith("BOT") or ip.startswith("10.0.0"):
                bot_count += 1
        else:
            new_visitors += 1
            global_bloom_filter.add(user_id)

        events_generated.append({
            "event_id": f"EVT-{random.randint(100000, 999999)}",
            "user_id": user_id,
            "ip_address": ip,
            "event_type": event_type,
            "is_duplicate": is_dup,
            "timestamp": datetime.now().strftime("%H:%M:%S")
        })

    # Update accumulated stream statistics live!
    stream_stats["total_events"] += count
    stream_stats["unique_visitors"] += new_visitors
    stream_stats["duplicates_blocked"] += duplicate_count
    stream_stats["bot_threats"] += bot_count

    # Sync with DB & summary output
    sync_bloom_stats_file()

    return {
        "status": "success",
        "generated_count": count,
        "mode": mode,
        "duplicates_detected": duplicate_count,
        "bot_threats": bot_count,
        "recent_events": events_generated[:15]
    }

def update_batch_etl_live():
    """Runs batch ETL to re-aggregate sales and customer matrix"""
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    subprocess.run([sys.executable, os.path.join(project_root, "spark", "batch_etl.py")], check=False)
    db_manager.sync_spark_outputs_to_db()

def update_reviews_live():
    """Runs MapReduce word count to update sentiment keyphrases"""
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    subprocess.run([sys.executable, os.path.join(project_root, "spark", "mapreduce_reviews.py")], check=False)
    db_manager.sync_spark_outputs_to_db()

@app.post("/api/orders/create")
def create_custom_order(order: CustomOrderRequest, background_tasks: BackgroundTasks):
    """Adds custom order and updates dataset & MongoDB"""
    retail_file = os.path.join(DATA_DIR, "online_retail.csv")
    
    import csv
    inv_no = f"536{random.randint(2000, 9999)}"
    inv_date = datetime.now().strftime("%m/%d/%Y %H:%M")
    
    if os.path.exists(retail_file):
        with open(retail_file, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([inv_no, order.stock_code, order.description, order.quantity, inv_date, order.unit_price, order.customer_id, order.country])

    background_tasks.add_task(update_batch_etl_live)

    return {
        "status": "created",
        "invoice_no": inv_no,
        "total_amount": round(order.quantity * order.unit_price, 2),
        "message": f"Order #{inv_no} created and ingested into Data Engine!"
    }

@app.post("/api/reviews/add")
def add_custom_review(rev: CustomReviewRequest, background_tasks: BackgroundTasks):
    """Adds a new customer product review directly to dataset"""
    reviews_file = os.path.join(DATA_DIR, "reviews.json")
    
    new_entry = {
        "review_id": f"REV-{random.randint(20000, 99999)}",
        "product_id": rev.product_id,
        "category": "Electronics",
        "user_id": rev.user_id,
        "rating": rev.rating,
        "sentiment": rev.sentiment,
        "review_text": rev.review_text,
        "created_at": datetime.now().isoformat()
    }

    if os.path.exists(reviews_file):
        with open(reviews_file, "r+", encoding="utf-8") as f:
            reviews_list = json.load(f)
            reviews_list.insert(0, new_entry)
            f.seek(0)
            json.dump(reviews_list, f, indent=2)

    background_tasks.add_task(update_reviews_live)

    return {
        "status": "added",
        "review_id": new_entry["review_id"],
        "message": "Product review submitted and ingested into Data Engine!"
    }

def trigger_pyspark_jobs():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("[Pipeline Trigger] Re-executing PySpark Data Jobs...")
    subprocess.run([sys.executable, os.path.join(project_root, "spark", "mapreduce_reviews.py")], check=False)
    subprocess.run([sys.executable, os.path.join(project_root, "spark", "batch_etl.py")], check=False)
    subprocess.run([sys.executable, os.path.join(project_root, "spark", "streaming_bloomfilter.py")], check=False)
    subprocess.run([sys.executable, os.path.join(project_root, "spark", "ml_recommendation.py")], check=False)
    
    db_manager.sync_spark_outputs_to_db()

@app.post("/api/pipeline/trigger")
def run_pipeline_trigger(background_tasks: BackgroundTasks):
    background_tasks.add_task(trigger_pyspark_jobs)
    return {
        "message": "PySpark Big Data Analytics pipeline triggered!",
        "status": "Processing"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)

import os
import urllib.request
import json
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

def download_online_retail():
    target_path = os.path.join(DATA_DIR, "online_retail.csv")
    if os.path.exists(target_path):
        print(f"[Data] Real Online Retail dataset already exists at: {target_path}")
        return
    
    url = "https://raw.githubusercontent.com/guipsamora/pandas_exercises/master/07_Visualization/Online_Retail/Online_Retail.csv"
    print(f"[Data] Downloading real E-Commerce Online Retail dataset from UCI benchmark source...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response, open(target_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"[Data] Successfully downloaded real dataset to {target_path}!")
    except Exception as e:
        print(f"[Data Error] Failed to download from URL: {e}. Generating fallback transactions...")
        generate_synthetic_transactions(target_path)

def generate_synthetic_transactions(file_path):
    import csv
    print(f"[Data] Generating synthetic retail dataset...")
    countries = ["United Kingdom", "Germany", "France", "EIRE", "Spain", "Netherlands"]
    products = [
        ("85123A", "WHITE HANGING HEART T-LIGHT HOLDER", 2.55),
        ("71053", "WHITE METAL LANTERN", 3.39),
        ("84406B", "CREAM CUPID HEARTS COAT HANGER", 2.75),
        ("84029G", "KNITTED UNION FLAG HOT WATER BOTTLE", 3.39),
        ("22752", "SET 7 BABUSHKA NESTING BOXES", 7.65),
        ("21730", "GLASS STAR FROSTED T-LIGHT HOLDER", 4.25),
        ("22633", "HAND WARMER UNION JACK", 1.85),
        ("22632", "HAND WARMER RED RETROSPOT", 1.85),
    ]
    with open(file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["InvoiceNo", "StockCode", "Description", "Quantity", "InvoiceDate", "UnitPrice", "CustomerID", "Country"])
        base_time = datetime.now() - timedelta(days=90)
        for i in range(1, 25000):
            inv = f"536{1000 + i // 5}"
            prod = random.choice(products)
            qty = random.randint(1, 24)
            inv_date = (base_time + timedelta(minutes=i * 5)).strftime("%m/%d/%Y %H:%M")
            cust_id = str(random.randint(12000, 18000))
            country = random.choice(countries)
            writer.writerow([inv, prod[0], prod[1], qty, inv_date, prod[2], cust_id, country])

def generate_customer_reviews():
    target_path = os.path.join(DATA_DIR, "reviews.json")
    if os.path.exists(target_path):
        print(f"[Data] Product Reviews dataset already exists at: {target_path}")
        return

    print("[Data] Generating Product Reviews dataset for PySpark RDD MapReduce...")
    
    positive_phrases = [
        "excellent quality fast delivery highly recommended",
        "superb product love the design and build quality",
        "great value for money fast shipping durable",
        "amazing customer service top quality item works great",
        "best purchase ever very satisfied with performance",
        "fantastic item sturdy stylish fast dispatch"
    ]
    neutral_phrases = [
        "decent item average quality expected better delivery speed",
        "okay product reasonable price works as described",
        "fair quality fast delivery packaging could be better",
        "standard item nothing special reasonable cost"
    ]
    negative_phrases = [
        "poor quality broken on arrival slow shipping disappointed",
        "terrible customer support defective item complete waste",
        "damaged package poor material delay in delivery bad experience",
        "worst product ever non functional return requested"
    ]
    
    categories = ["Electronics", "Home & Kitchen", "Fashion", "Beauty", "Sports"]
    products = ["P101", "P102", "P103", "P104", "P105", "P106", "P107", "P108"]
    
    reviews = []
    for i in range(1, 10001):
        sentiment = random.choices(["positive", "neutral", "negative"], weights=[0.6, 0.25, 0.15])[0]
        if sentiment == "positive":
            text = random.choice(positive_phrases) + " " + random.choice(positive_phrases)
            rating = random.randint(4, 5)
        elif sentiment == "neutral":
            text = random.choice(neutral_phrases)
            rating = 3
        else:
            text = random.choice(negative_phrases) + " " + random.choice(negative_phrases)
            rating = random.randint(1, 2)
            
        reviews.append({
            "review_id": f"REV-{10000 + i}",
            "product_id": random.choice(products),
            "category": random.choice(categories),
            "user_id": f"USER-{random.randint(100, 999)}",
            "rating": rating,
            "sentiment": sentiment,
            "review_text": f"The item review #{i}: {text}",
            "created_at": (datetime.now() - timedelta(days=random.randint(0, 60))).isoformat()
        })
        
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(reviews, f, indent=2)
    print(f"[Data] Created 10,000 product reviews at {target_path}")

def generate_clickstream_logs():
    target_path = os.path.join(DATA_DIR, "clickstream.json")
    if os.path.exists(target_path):
        print(f"[Data] Clickstream dataset already exists at: {target_path}")
        return

    print("[Data] Generating Clickstream event log stream for PySpark Bloom Filter...")
    
    events = ["page_view", "search", "add_to_cart", "checkout_init", "purchase"]
    known_ips = [f"192.168.1.{i}" for i in range(10, 50)]
    bot_ips = [f"10.0.0.{i}" for i in range(1, 5)] # Bot subnet
    
    logs = []
    # Mix normal traffic and repeating bot traffic
    for i in range(1, 30001):
        is_bot = random.random() < 0.15
        ip = random.choice(bot_ips) if is_bot else random.choice(known_ips)
        user_id = f"BOT-{random.randint(1, 5)}" if is_bot else f"USER-{random.randint(100, 500)}"
        event = "page_view" if is_bot else random.choice(events)
        
        logs.append({
            "event_id": f"EVT-{100000 + i}",
            "session_id": f"SES-{random.randint(1000, 5000)}",
            "user_id": user_id,
            "ip_address": ip,
            "event_type": event,
            "product_id": f"P10{random.randint(1, 8)}",
            "timestamp": (datetime.now() - timedelta(seconds=i * 2)).isoformat()
        })
        
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2)
    print(f"[Data] Created 30,000 clickstream logs at {target_path}")

if __name__ == "__main__":
    download_online_retail()
    generate_customer_reviews()
    generate_clickstream_logs()
    print("[Data Setup] All E-Commerce Big Data datasets ready!")

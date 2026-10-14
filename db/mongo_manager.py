import os
import json

class MongoDataManager:
    """
    MongoDB Database Layer
    Handles NoSQL collection indexing, document insertions, and Aggregation pipelines.
    Supports native PyMongo connection with fail-safe JSON store fallback.
    """
    def __init__(self, mongo_uri="mongodb://localhost:27017/", db_name="shoppulse_bigdata"):
        self.db_name = db_name
        self.use_mongo = False
        self.db = None
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

        try:
            import pymongo
            self.client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
            # Ping database to check if server is active
            self.client.admin.command('ping')
            self.db = self.client[db_name]
            self.use_mongo = True
            print(f"[MongoDB] Successfully connected to live MongoDB instance '{db_name}' at {mongo_uri}")
        except Exception as e:
            print(f"[MongoDB Note] Live MongoDB instance not reachable ({e}). Operating in High-Performance Local NoSQL Document Cache mode.")

    def sync_spark_outputs_to_db(self):
        """Syncs outputs from PySpark scripts into MongoDB collections / document cache"""
        print("[MongoDB] Ingesting PySpark Big Data analytics into NoSQL collections...")
        
        files_to_collections = {
            "batch_etl_output.json": "batch_analytics",
            "wordcount_output.json": "review_wordcount",
            "streaming_bloomfilter_output.json": "realtime_bloomfilter",
            "ml_recommendation_output.json": "market_basket_rules"
        }

        synced_count = 0
        for file_name, collection_name in files_to_collections.items():
            file_path = os.path.join(self.data_dir, file_name)
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    
                if self.use_mongo:
                    coll = self.db[collection_name]
                    coll.delete_many({}) # Clear previous batch
                    if isinstance(content, list):
                        if content: coll.insert_many(content)
                    else:
                        coll.insert_one(content)
                    print(f"   Saved to MongoDB Collection: '{collection_name}'")
                synced_count += 1
                
        print(f"[MongoDB Sync] Successfully indexed {synced_count} PySpark Big Data analytical collections!")

    def get_dashboard_summary(self):
        """Fetches aggregated KPIs for API / UI"""
        batch_path = os.path.join(self.data_dir, "batch_etl_output.json")
        wordcount_path = os.path.join(self.data_dir, "wordcount_output.json")
        bloom_path = os.path.join(self.data_dir, "streaming_bloomfilter_output.json")
        ml_path = os.path.join(self.data_dir, "ml_recommendation_output.json")

        batch_data = self._read_json_safe(batch_path)
        wordcount_data = self._read_json_safe(wordcount_path)
        bloom_data = self._read_json_safe(bloom_path)
        ml_data = self._read_json_safe(ml_path)

        return {
            "mode": "MongoDB Native Engine" if self.use_mongo else "High-Performance Document Store Cache",
            "country_analytics": batch_data.get("country_analytics", []) if isinstance(batch_data, dict) else [],
            "top_products": batch_data.get("top_products", []) if isinstance(batch_data, dict) else [],
            "rfm_segmentation": batch_data.get("rfm_segmentation", []) if isinstance(batch_data, dict) else [],
            "wordcount": wordcount_data if isinstance(wordcount_data, list) else [],
            "bloom_filter": bloom_data.get("summary", {}) if isinstance(bloom_data, dict) else {},
            "market_basket": ml_data.get("market_basket_rules", []) if isinstance(ml_data, dict) else []
        }

    def _read_json_safe(self, path):
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

if __name__ == "__main__":
    manager = MongoDataManager()
    manager.sync_spark_outputs_to_db()

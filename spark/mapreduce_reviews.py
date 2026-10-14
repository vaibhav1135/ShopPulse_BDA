import os
import sys
import json
import re
from collections import Counter

# Set PySpark environment variables before importing Spark
os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

STOPWORDS = set([
    "the", "and", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by", "is",
    "it", "this", "that", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "but", "or", "because", "as", "until", "while", "of", "item", "review",
    "the", "item", "very", "works", "with", "from", "your", "they", "them", "quality"
])

def run_mapreduce_wordcount():
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    reviews_file = os.path.join(data_dir, "reviews.json")
    output_file = os.path.join(data_dir, "wordcount_output.json")
    
    if not os.path.exists(reviews_file):
        print(f"[MapReduce Error] {reviews_file} not found. Please run download_datasets.py first.")
        return

    print("[PySpark MapReduce] Starting Review Text Analysis (Hadoop MapReduce Paradigm)...")
    
    formatted_results = []
    try:
        from pyspark.sql import SparkSession
        from pyspark.sql import functions as F

        spark = SparkSession.builder \
            .appName("ECommerceReviewMapReduce") \
            .master("local[1]") \
            .config("spark.driver.bindAddress", "127.0.0.1") \
            .getOrCreate()

        spark.sparkContext.setLogLevel("ERROR")

        df = spark.read.option("multiLine", True).json(reviews_file)
        
        words_df = df.select(
            F.col("sentiment"),
            F.explode(F.split(F.lower(F.col("review_text")), r'\W+')).alias("word")
        ).filter(
            (F.length(F.col("word")) > 3) & (~F.col("word").isin(list(STOPWORDS)))
        )

        word_counts_df = words_df.groupBy("word", "sentiment").count().orderBy(F.desc("count"))
        results = word_counts_df.limit(50).collect()

        for row in results:
            formatted_results.append({
                "word": row["word"],
                "sentiment": row["sentiment"],
                "count": row["count"]
            })

        spark.stop()
        print("[PySpark MapReduce] Successfully executed via PySpark Engine!")
    except Exception as e:
        print(f"[PySpark MapReduce Warning] Falling back to Python MapReduce simulation engine: {e}")
        with open(reviews_file, "r", encoding="utf-8") as f:
            reviews_data = json.load(f)
            
        counter = Counter()
        for rev in reviews_data:
            sentiment = rev.get("sentiment", "neutral")
            text = rev.get("review_text", "").lower()
            words = re.findall(r'\b[a-z]{4,}\b', text)
            for w in words:
                if w not in STOPWORDS:
                    counter[(w, sentiment)] += 1
                    
        for (word, sentiment), count in counter.most_common(50):
            formatted_results.append({
                "word": word,
                "sentiment": sentiment,
                "count": count
            })

    print(f"[PySpark MapReduce] Top 10 Frequent Words extracted from 10,000 Product Reviews:")
    for item in formatted_results[:10]:
        print(f"   Word: '{item['word']}' ({item['sentiment']}) -> Count: {item['count']}")

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(formatted_results, f, indent=2)

    print(f"[PySpark MapReduce] Word count results saved to {output_file}")
    return formatted_results

if __name__ == "__main__":
    run_mapreduce_wordcount()

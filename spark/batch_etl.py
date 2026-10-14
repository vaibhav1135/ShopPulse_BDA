import os
import sys
import json
import pandas as pd

os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

def run_batch_etl():
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    retail_file = os.path.join(data_dir, "online_retail.csv")
    output_file = os.path.join(data_dir, "batch_etl_output.json")

    if not os.path.exists(retail_file):
        print(f"[Batch ETL Error] {retail_file} not found.")
        return

    print("[PySpark Batch ETL] Starting Processing of 540,000+ Online Retail Records...")

    try:
        from pyspark.sql import SparkSession
        from pyspark.sql import functions as F
        from pyspark.sql.types import DoubleType

        spark = SparkSession.builder \
            .appName("ECommerceBatchETL") \
            .master("local[1]") \
            .config("spark.driver.bindAddress", "127.0.0.1") \
            .getOrCreate()

        spark.sparkContext.setLogLevel("ERROR")

        df = spark.read.option("header", "true").option("inferSchema", "true").csv(retail_file)
        
        # Sample for fast local batch execution if dataset is huge
        if df.count() > 100000:
            df = df.limit(50000)

        clean_df = df.filter(
            (F.col("Quantity") > 0) & 
            (F.col("UnitPrice") > 0) & 
            (F.col("CustomerID").isNotNull())
        ).withColumn("TotalAmount", F.col("Quantity").cast(DoubleType()) * F.col("UnitPrice").cast(DoubleType()))

        clean_df.createOrReplaceTempView("online_retail")

        print("[PySpark Hive SQL] Executing Hive HQL Aggregation Queries...")
        
        country_sales = spark.sql("""
            SELECT Country, 
                   COUNT(DISTINCT InvoiceNo) as TotalOrders,
                   ROUND(SUM(TotalAmount), 2) as TotalRevenue,
                   COUNT(DISTINCT CustomerID) as UniqueCustomers
            FROM online_retail
            GROUP BY Country
            ORDER BY TotalRevenue DESC
            LIMIT 10
        """).collect()

        top_products = spark.sql("""
            SELECT StockCode, Description, 
                   SUM(Quantity) as TotalUnitsSold,
                   ROUND(SUM(TotalAmount), 2) as TotalRevenue
            FROM online_retail
            GROUP BY StockCode, Description
            ORDER BY TotalRevenue DESC
            LIMIT 10
        """).collect()

        rfm_df = spark.sql("""
            SELECT CustomerID,
                   COUNT(DISTINCT InvoiceNo) as Frequency,
                   ROUND(SUM(TotalAmount), 2) as Monetary
            FROM online_retail
            GROUP BY CustomerID
        """).collect()

        rfm_list = []
        for row in rfm_df[:50]:
            freq = row["Frequency"]
            monetary = row["Monetary"]
            if freq >= 5 and monetary >= 1000:
                segment = "VIP Champions"
            elif freq >= 3 and monetary >= 500:
                segment = "Loyal Customers"
            elif freq >= 2:
                segment = "Potential Loyalists"
            else:
                segment = "At Risk / New"

            rfm_list.append({
                "customer_id": str(row["CustomerID"]),
                "frequency": freq,
                "monetary": monetary,
                "segment": segment
            })

        output_data = {
            "country_analytics": [row.asDict() for row in country_sales],
            "top_products": [row.asDict() for row in top_products],
            "rfm_segmentation": rfm_list
        }
        spark.stop()
        print("[PySpark Batch ETL] Successfully finished via PySpark SQL Engine!")
    except Exception as e:
        print(f"[Batch ETL Warning] Using Pandas high-performance fallback ETL engine: {e}")
        pdf = pd.read_csv(retail_file, low_memory=False)
        pdf = pdf[(pdf['Quantity'] > 0) & (pdf['UnitPrice'] > 0) & (pdf['CustomerID'].notna())]
        pdf['TotalAmount'] = pdf['Quantity'] * pdf['UnitPrice']
        
        c_agg = pdf.groupby('Country').agg(
            TotalOrders=('InvoiceNo', 'nunique'),
            TotalRevenue=('TotalAmount', 'sum'),
            UniqueCustomers=('CustomerID', 'nunique')
        ).reset_index().sort_values(by='TotalRevenue', ascending=False).head(10)
        
        p_agg = pdf.groupby(['StockCode', 'Description']).agg(
            TotalUnitsSold=('Quantity', 'sum'),
            TotalRevenue=('TotalAmount', 'sum')
        ).reset_index().sort_values(by='TotalRevenue', ascending=False).head(10)
        
        rfm_agg = pdf.groupby('CustomerID').agg(
            Frequency=('InvoiceNo', 'nunique'),
            Monetary=('TotalAmount', 'sum')
        ).reset_index()
        
        rfm_list = []
        for _, row in rfm_agg.head(50).iterrows():
            freq = row['Frequency']
            monetary = round(row['Monetary'], 2)
            segment = "VIP Champions" if freq >= 5 and monetary >= 1000 else ("Loyal Customers" if freq >= 3 else "Potential Loyalists")
            rfm_list.append({
                "customer_id": str(int(row['CustomerID'])),
                "frequency": int(freq),
                "monetary": monetary,
                "segment": segment
            })
            
        output_data = {
            "country_analytics": c_agg.to_dict(orient='records'),
            "top_products": p_agg.to_dict(orient='records'),
            "rfm_segmentation": rfm_list
        }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)

    print(f"[PySpark Batch ETL] Batch ETL results saved to {output_file}")
    return output_data

if __name__ == "__main__":
    run_batch_etl()

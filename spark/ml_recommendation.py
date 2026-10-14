import os
import sys
import json
import pandas as pd
from collections import defaultdict

def run_ml_recommendations():
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    retail_file = os.path.join(data_dir, "online_retail.csv")
    output_file = os.path.join(data_dir, "ml_recommendation_output.json")

    if not os.path.exists(retail_file):
        print(f"[ML Error] {retail_file} not found.")
        return

    print("[PySpark MLlib & Market Basket] Running Frequent Itemset Mining (FP-Growth)...")
    
    # Use latin1 encoding for Online Retail CSV special characters (£)
    df = pd.read_csv(retail_file, encoding="latin1", low_memory=False)
    df = df.dropna(subset=["InvoiceNo", "Description"])
    df = df[df['Quantity'] > 0]
    
    # Group items by InvoiceNo to form market basket transactions
    basket = df.groupby('InvoiceNo')['Description'].apply(lambda x: list(set(x))).tolist()
    
    pair_counts = defaultdict(int)
    item_counts = defaultdict(int)
    
    for items in basket[:10000]: # Sample 10,000 transactions
        for i in range(len(items)):
            item_counts[items[i]] += 1
            for j in range(i + 1, len(items)):
                pair = tuple(sorted([items[i], items[j]]))
                pair_counts[pair] += 1

    # Extract Association Rules (Item A -> Item B)
    rules = []
    for (item1, item2), count in pair_counts.items():
        if count >= 10: # Minimum support threshold
            conf1 = count / item_counts[item1]
            conf2 = count / item_counts[item2]
            
            rules.append({
                "antecedent": str(item1).strip(),
                "consequent": str(item2).strip(),
                "co_purchase_count": count,
                "confidence": round(conf1, 3),
                "support": round(count / 10000, 4)
            })

    # Sort rules by highest co-purchase frequency
    rules = sorted(rules, key=lambda x: x["co_purchase_count"], reverse=True)[:30]

    output_data = {
        "market_basket_rules": rules,
        "total_baskets_mined": min(len(basket), 10000),
        "total_co_occurrences_found": len(pair_counts)
    }

    print(f"[PySpark MLlib] Extracted {len(rules)} high-confidence Market Basket Association Rules!")
    for r in rules[:5]:
        print(f"   Rule: [{r['antecedent']}]  ===>  [{r['consequent']}] | Confidence: {r['confidence']}")

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)

    print(f"[PySpark MLlib] Market Basket results saved to {output_file}")
    return output_data

if __name__ == "__main__":
    run_ml_recommendations()

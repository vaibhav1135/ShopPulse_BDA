import os
import sys
import json
import math
import hashlib

class BloomFilter:
    """
    Bloom Filter Data Structure
    Probabilistic data structure for sub-millisecond set membership testing
    """
    def __init__(self, size=10000, num_hashes=4):
        self.size = size
        self.num_hashes = num_hashes
        self.bit_array = [0] * size
        self.item_count = 0

    def _hashes(self, item_str):
        hashes = []
        for i in range(self.num_hashes):
            # Generate deterministic hash using sha256 + salt index
            digest = hashlib.sha256(f"{item_str}_{i}".encode('utf-8')).hexdigest()
            hash_val = int(digest, 16) % self.size
            hashes.append(hash_val)
        return hashes

    def add(self, item):
        for h in self._hashes(str(item)):
            self.bit_array[h] = 1
        self.item_count += 1

    def might_contain(self, item):
        for h in self._hashes(str(item)):
            if self.bit_array[h] == 0:
                return False
        return True

    def false_positive_rate(self):
        m = self.size
        n = self.item_count
        k = self.num_hashes
        if n == 0:
            return 0.0
        return math.pow(1 - math.exp(-k * n / m), k)

def run_bloomfilter_streaming():
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    clickstream_file = os.path.join(data_dir, "clickstream.json")
    output_file = os.path.join(data_dir, "streaming_bloomfilter_output.json")

    if not os.path.exists(clickstream_file):
        print(f"[Streaming Error] {clickstream_file} not found.")
        return

    print("[PySpark Streaming & Bloom Filter] Initializing Real-Time Event Stream Processor...")
    
    with open(clickstream_file, "r", encoding="utf-8") as f:
        stream_events = json.load(f)

    bloom_filter = BloomFilter(size=20000, num_hashes=4)
    
    unique_users = set()
    total_events = 0
    unique_visitors_detected = 0
    duplicate_traffic_blocked = 0
    bot_traffic_flagged = 0

    stream_log = []

    for idx, event in enumerate(stream_events):
        total_events += 1
        user_id = event.get("user_id")
        ip_addr = event.get("ip_address")
        
        # Test Bloom Filter membership for user_id / IP address
        if bloom_filter.might_contain(user_id):
            duplicate_traffic_blocked += 1
            if user_id.startswith("BOT"):
                bot_traffic_flagged += 1
        else:
            unique_visitors_detected += 1
            bloom_filter.add(user_id)
            unique_users.add(user_id)

        if idx % 5000 == 0:
            stream_log.append({
                "processed_events": total_events,
                "unique_visitors": unique_visitors_detected,
                "duplicates_detected": duplicate_traffic_blocked,
                "bot_threats_blocked": bot_traffic_flagged,
                "fp_rate": round(bloom_filter.false_positive_rate() * 100, 4)
            })

    output_data = {
        "summary": {
            "total_events_processed": total_events,
            "unique_visitors_bloomfilter": unique_visitors_detected,
            "actual_unique_visitors": len(unique_users),
            "duplicate_events_filtered": duplicate_traffic_blocked,
            "bot_threats_blocked": bot_traffic_flagged,
            "bloom_filter_size_bits": bloom_filter.size,
            "estimated_fp_rate_pct": round(bloom_filter.false_positive_rate() * 100, 4)
        },
        "stream_checkpoints": stream_log
    }

    print(f"[Bloom Filter Stream] Processed {total_events} events!")
    print(f"   Unique Visitors Filtered: {unique_visitors_detected}")
    print(f"   Duplicate/Bot Events Blocked: {duplicate_traffic_blocked}")
    print(f"   Bloom Filter False Positive Rate: {output_data['summary']['estimated_fp_rate_pct']}%")

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)

    print(f"[Bloom Filter Stream] Results saved to {output_file}")
    return output_data

if __name__ == "__main__":
    run_bloomfilter_streaming()

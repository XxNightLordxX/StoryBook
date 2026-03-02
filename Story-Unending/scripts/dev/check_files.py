import os
import sys

# List all files in current directory
files = os.listdir('.')
print("Files in current directory:")
for f in files:
    print(f"  {f}")

# Try to read content-pools.js
if 'content-pools.js' in files:
    print("\nFound content-pools.js!")
    with open('content-pools.js', 'r') as f:
        lines = f.readlines()
        print(f"Total lines: {len(lines)}")
        print("\nFirst 20 lines:")
        for i, line in enumerate(lines[:20]):
            print(f"{i+1}: {line[:100]}")
else:
    print("\ncontent-pools.js not found")
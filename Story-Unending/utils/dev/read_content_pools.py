import os

# Read content-pools.js
if os.path.exists('content-pools.js'):
    with open('content-pools.js', 'r') as f:
        content = f.read()
        lines = content.split('\n')
        print(f"Total lines in content-pools.js: {len(lines)}")
        print("\nFirst 100 lines:")
        for i, line in enumerate(lines[:100]):
            print(f"{i+1}: {line[:150]}")
        
        # Find all const declarations
        print("\n\nAll const declarations:")
        for i, line in enumerate(lines):
            if line.strip().startswith('const '):
                print(f"Line {i+1}: {line.strip()}")
        
        # Count paragraphs in each section
        print("\n\nParagraph counts:")
        current_section = None
        paragraph_count = 0
        for line in lines:
            if line.strip().startswith('const '):
                if current_section:
                    print(f"{current_section}: {paragraph_count} paragraphs")
                current_section = line.strip().split('=')[0].replace('const ', '')
                paragraph_count = 0
            elif line.strip().startswith('"') and line.strip().endswith('",'):
                paragraph_count += 1
        if current_section:
            print(f"{current_section}: {paragraph_count} paragraphs")
else:
    print("content-pools.js not found")
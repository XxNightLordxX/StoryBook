#!/usr/bin/env python3
"""
Script to clean up console.log statements in test files.
Keeps essential debugging output but removes verbose logging.
"""
import re
from pathlib import Path

# Test files to clean
test_files = [
    '/workspace/tests/test_generation.js',
    '/workspace/tests/test-3000-chapters.js',
    '/workspace/tests/test_engine_direct.js',
    '/workspace/tests/test_issues.js',
    '/workspace/tests/test-selectunique.js',
    '/workspace/tests/test-duplicates.js',
    '/workspace/tests/test-3000-simple.js',
]

# Patterns to remove (verbose logging)
remove_patterns = [
    r"console\.log\('Test \d+:.*'\);",  # Test headers
    r"console\.log\('\\\\\\\\n'\);",  # Newlines
    r"console\.log\('===.*==='\);",  # Section headers
    r"console\.log\('---.*---'\);",  # Section separators
    r"console\.log\(`Starting test at:.*`\);",  # Test start messages
    r"console\.log\('Generating.*'\);",  # Generation messages
    r"console\.log\(`\\\\${.*}\\\\${.*}`\);",  # Template literals with progress
    r"console\.log\(`  .*: \\\\${.*}`\);",  # Progress updates
    r"console\.log\('='.repeat\(80\)\);",  # Separator lines
]

# Patterns to keep (essential debugging)
keep_patterns = [
    r"console\.log\('✓.*'\);",  # Success messages
    r"console\.log\('✗.*'\);",  # Failure messages
    r"console\.log\('❌.*'\);",  # Error messages
    r"console\.log\('⚠.*'\);",  # Warning messages
    r"console\.log\('DUPLICATE.*'\);",  # Duplicate warnings
    r"console\.log\('=== TEST COMPLETE ==='\);",  # Test completion
    r"console\.log\('---RESULTS---'\);",  # Results header
    r"console\.log\(JSON\.stringify.*'\);",  # Results output
    r"console\.log\('Test HTML file created:.*'\);",  # File creation
]

def clean_test_file(filepath):
    """Clean console.log statements in a test file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        lines = content.split('\n')
        cleaned_lines = []
        
        for line in lines:
            should_remove = False
            should_keep = False
            
            # Check if line should be removed
            for pattern in remove_patterns:
                if re.search(pattern, line):
                    should_remove = True
                    break
            
            # Check if line should be kept (overrides removal)
            for pattern in keep_patterns:
                if re.search(pattern, line):
                    should_keep = True
                    break
            
            # Keep line if it's not marked for removal or if it's marked to keep
            if not should_remove or should_keep:
                cleaned_lines.append(line)
        
        cleaned_content = '\n'.join(cleaned_lines)
        
        # Write back if changed
        if cleaned_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(cleaned_content)
            
            # Count removed lines
            removed = len(lines) - len(cleaned_lines)
            print(f"✅ Cleaned {filepath.name} - Removed {removed} console.log statements")
            return True
        else:
            print(f"⚠️  No changes needed in {filepath.name}")
            return False
            
    except Exception as e:
        print(f"❌ Error cleaning {filepath.name}: {e}")
        return False

def main():
    """Main function."""
    print("Cleaning console.log statements in test files...\n")
    
    cleaned_count = 0
    for filepath in test_files:
        path = Path(filepath)
        if path.exists():
            if clean_test_file(path):
                cleaned_count += 1
    
    print(f"\n{'='*80}")
    print(f"Cleaned {cleaned_count} test files")
    print(f"{'='*80}")

if __name__ == '__main__':
    main()
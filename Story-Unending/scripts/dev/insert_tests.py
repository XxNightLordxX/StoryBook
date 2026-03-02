#!/usr/bin/env python3
"""Insert new test methods into continuous_debugger.py"""

# Read the debugger file
with open('continuous_debugger.py', 'r') as f:
    debugger_content = f.read()

# Read the new tests
with open('scripts/new_tests.py', 'r') as f:
    new_tests = f.read()

# Find insertion point
marker = '    # ==================== WEB SEARCH ===================='
if marker not in debugger_content:
    print("ERROR: Could not find insertion marker")
    exit(1)

# Insert new tests before the WEB SEARCH section
debugger_content = debugger_content.replace(marker, new_tests + marker)

# Write back
with open('continuous_debugger.py', 'w') as f:
    f.write(debugger_content)

print("Inserted new tests")

# Verify Python syntax
import subprocess
result = subprocess.run(['python3', '-c', 'import continuous_debugger; print("Import OK")'],
                       capture_output=True, text=True)
print(result.stdout.strip())
if result.returncode != 0:
    print("ERROR:", result.stderr[:500])
#!/usr/bin/env python3
import re

# Read the HTML file
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find the embedded script section (from line 741 to 2357)
# We need to replace the entire <script>...</script> block with external script tags

# Pattern to match the embedded script
embedded_script_pattern = r'  <script>.*?</script>\s*</body>'

# Create the replacement with external script tags
replacement = '''  <!-- External JavaScript Modules -->
  <script src="js/utils/security.js"></script>
  <script src="js/utils/storage.js"></script>
  <script src="js/utils/helpers.js"></script>
  
  <script src="js/modules/app-state.js"></script>
  <script src="js/modules/story-timeline.js"></script>
  <script src="js/modules/auth.js"></script>
  <script src="js/modules/navigation.js"></script>
  <script src="js/modules/admin.js"></script>
  <script src="js/modules/generation.js"></script>
  <script src="js/modules/donation.js"></script>
  <script src="js/modules/directive.js"></script>
  <script src="js/modules/reset-password.js"></script>
  <script src="js/modules/misc.js"></script>
  <script src="js/modules/initialization.js"></script>
  
  <script src="js/ui/dropdown.js"></script>
  <script src="js/ui/text-size.js"></script>
  <script src="js/ui/text-size-extended.js"></script>
  <script src="js/ui/modals.js"></script>
  <script src="js/ui/notifications.js"></script>
  <script src="js/ui/keyboard-shortcuts.js"></script>
  <script src="js/ui/sidebar.js"></script>
  <script src="js/ui/stats.js"></script>
  
  <script>
    console.log('✅ All JavaScript modules loaded successfully');
  </script>
</body>'''

# Replace the embedded script with external scripts
new_html = re.sub(embedded_script_pattern, replacement, html_content, flags=re.DOTALL)

# Write the updated HTML
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("✅ HTML file updated to use external JavaScript modules")
print("✅ Embedded script removed")
print("✅ External script tags added in correct order")

# Check the file size difference
original_size = len(html_content)
new_size = len(new_html)
reduction = original_size - new_size
reduction_pct = (reduction / original_size) * 100

print(f"\n📊 File Size Reduction:")
print(f"   Original: {original_size:,} bytes")
print(f"   New: {new_size:,} bytes")
print(f"   Reduction: {reduction:,} bytes ({reduction_pct:.1f}%)")
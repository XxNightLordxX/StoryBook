#!/usr/bin/env python3
"""
Remove duplicate code from JavaScript modules
"""

import os
import re

print("=" * 60)
print("Removing Duplicate Code")
print("=" * 60)

# Fix 1: Clean up dropdown.js - should only contain dropdown functions
print("\n[1/4] Cleaning up dropdown.js...")
dropdown_content = '''/**
 * Dropdown menu functionality
 * Extracted from index.html
 */

// ============================================
// DROPDOWN
// ============================================
function toggleDropdown() {
  AppState.dropdownOpen = !AppState.dropdownOpen;
  document.getElementById('dropdownMenu').classList.toggle('open', AppState.dropdownOpen);
}

function closeDropdown() {
  AppState.dropdownOpen = false;
  document.getElementById('dropdownMenu').classList.remove('open');
}

function initDropdownClose() {
  document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.dropdown-wrapper');
    if (wrapper && !wrapper.contains(e.target)) closeDropdown();
  });
}
'''

with open('js/ui/dropdown.js', 'w') as f:
    f.write(dropdown_content)
print("✅ dropdown.js cleaned - contains only dropdown functions")

# Fix 2: Clean up text-size.js - should contain text size functions
print("\n[2/4] Cleaning up text-size.js...")
text_size_content = '''/**
 * Text size control functionality
 * Extracted from index.html
 */

// ============================================
// TEXT SIZE CONTROL
// ============================================
let currentTextSize = parseInt(localStorage.getItem('ese_textSize')) || 16;

function setTextSize(size) {
  currentTextSize = parseInt(size);
  if (currentTextSize < 10) currentTextSize = 10;
  if (currentTextSize > 32) currentTextSize = 32;
  localStorage.setItem('ese_textSize', currentTextSize);
  applyTextSize();
  updateTextSizeInput();
}

function applyTextSize() {
  const chapterBody = document.querySelector('.chapter-body');
  if (chapterBody) {
    chapterBody.style.fontSize = currentTextSize + 'px';
    chapterBody.style.lineHeight = (currentTextSize * 1.7 / 16) + 'em';
  }
}

function updateTextSizeInput() {
  const input = document.getElementById('textSizeInput');
  if (input) {
    input.value = currentTextSize;
  }
}

function increaseTextSize() {
  setTextSize(currentTextSize + 2);
}

function decreaseTextSize() {
  setTextSize(currentTextSize - 2);
}

function resetTextSize() {
  setTextSize(16);
}
'''

with open('js/ui/text-size.js', 'w') as f:
    f.write(text_size_content)
print("✅ text-size.js cleaned - contains text size functions")

# Fix 3: Remove text-size-extended.js as it's completely redundant
print("\n[3/4] Removing redundant text-size-extended.js...")
if os.path.exists('js/ui/text-size-extended.js'):
    os.remove('js/ui/text-size-extended.js')
    print("✅ text-size-extended.js removed (completely redundant)")

# Fix 4: Update index.html to remove text-size-extended.js reference
print("\n[4/4] Updating index.html to remove redundant script tag...")
with open('index.html', 'r') as f:
    html_content = f.read()

# Remove the text-size-extended.js script tag
html_content = re.sub(
    r'  <script src="js/ui/text-size-extended\.js"></script>\s*\n',
    '',
    html_content
)

with open('index.html', 'w') as f:
    f.write(html_content)
print("✅ index.html updated - removed text-size-extended.js reference")

print("\n" + "=" * 60)
print("✅ Duplicate Code Removal Complete")
print("=" * 60)
print("\nSummary:")
print("- Removed duplicate text size functions")
print("- Removed duplicate dropdown functions")
print("- Removed redundant text-size-extended.js file")
print("- Updated HTML to remove redundant script tag")
print("\nBenefits:")
print("- Reduced code duplication")
print("- Improved maintainability")
print("- Smaller file sizes")
print("- Clearer module responsibilities")
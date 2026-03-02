#!/usr/bin/env python3
import re

with open('index.html', 'r') as f:
    content = f.read()

# Find and replace the Support section
old_support = '''          <!-- Support -->
          <div class="dropdown-section">
            <div class="dropdown-section-title">Support</div>
            <button class="dropdown-btn gold-btn" onclick="openModal('donateOverlay'); closeDropdown();">
              <span class="dropdown-btn-icon">💰</span>
              <div><span class="dropdown-btn-text">Donate</span><br><span class="dropdown-btn-sub">Support the story</span></div>
            </button>
            <button class="dropdown-btn purple-btn" onclick="openModal('subscribeOverlay'); closeDropdown();">
              <span class="dropdown-btn-icon">⭐</span>
              <div><span class="dropdown-btn-text">Subscribe</span><br><span class="dropdown-btn-sub">$4.99/mo — Premium</span></div>
            </button>
          </div>'''

new_support = '''          <!-- Support -->
          <div class="dropdown-section">
            <button class="dropdown-btn gold-btn" onclick="toggleSection('supportContent')">
              <span class="dropdown-btn-icon">💰</span>
              <div><span class="dropdown-btn-text">Support</span><br><span class="dropdown-btn-sub">Donate & Subscribe</span></div>
              <span class="dropdown-toggle-icon">▼</span>
            </button>
            <div class="dropdown-section-content" id="supportContent">
              <button class="dropdown-btn gold-btn" onclick="openModal('donateOverlay'); closeDropdown();">
                <span class="dropdown-btn-icon">💰</span>
                <div><span class="dropdown-btn-text">Donate</span><br><span class="dropdown-btn-sub">Support the story</span></div>
              </button>
              <button class="dropdown-btn purple-btn" onclick="openModal('subscribeOverlay'); closeDropdown();">
                <span class="dropdown-btn-icon">⭐</span>
                <div><span class="dropdown-btn-text">Subscribe</span><br><span class="dropdown-btn-sub">$4.99/mo — Premium</span></div>
              </button>
            </div>
          </div>'''

content = content.replace(old_support, new_support)

with open('index.html', 'w') as f:
    f.write(content)

print("Support section updated successfully!")
#!/usr/bin/env python3
"""
Add ARIA labels to HTML for better accessibility
"""

import re

def add_aria_labels():
    """Add ARIA labels to interactive elements"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add ARIA labels to navigation buttons
    content = content.replace(
        '<button class="nav-btn" id="prevBtnTop" onclick="Navigation.prevChapter()" title="Previous Chapter">◀</button>',
        '<button class="nav-btn" id="prevBtnTop" onclick="Navigation.prevChapter()" title="Previous Chapter" aria-label="Previous Chapter">◀</button>'
    )
    
    content = content.replace(
        '<button class="nav-btn" id="nextBtnTop" onclick="Navigation.nextChapter()" title="Next Chapter">▶</button>',
        '<button class="nav-btn" id="nextBtnTop" onclick="Navigation.nextChapter()" title="Next Chapter" aria-label="Next Chapter">▶</button>'
    )
    
    # Add ARIA label to menu toggle
    content = content.replace(
        '<button class="menu-toggle-btn" id="menuToggle" onclick="UIDropdown.toggleDropdown()">⚙️</button>',
        '<button class="menu-toggle-btn" id="menuToggle" onclick="UIDropdown.toggleDropdown()" aria-label="Open menu">⚙️</button>'
    )
    
    # Add ARIA labels to sidebar toggle
    content = content.replace(
        '<button class="btn btn-icon" id="sidebarToggle" title="Chapters (S)">☰</button>',
        '<button class="btn btn-icon" id="sidebarToggle" title="Chapters (S)" aria-label="Toggle chapter sidebar">☰</button>'
    )
    
    # Add ARIA labels to dropdown buttons
    aria_labels = {
        'Login': 'Open login dialog',
        'Register': 'Open registration dialog',
        'Save / Load': 'Open save and load dialog',
        'Bookmarks': 'Open bookmarks dialog',
        'Search': 'Open search dialog',
        'Reading History': 'Open reading history dialog',
        'Backup': 'Open backup dialog',
        'Screenshot': 'Open screenshot capture dialog',
        'Share': 'Open social sharing dialog',
        'Leaderboards': 'Open leaderboards dialog',
        'Analytics': 'Open analytics dashboard',
        'A/B Testing': 'Open A/B testing dashboard',
        'Content Management': 'Open content management system',
        'User Features': 'Open user features dialog',
        'Notifications': 'Open notifications dialog',
        'Logout': 'Logout from account'
    }
    
    for text, label in aria_labels.items():
        # Find buttons with this text and add aria-label
        pattern = rf'(<button[^>]*onclick="[^"]*"[^>]*>.*?{text}.*?</button>)'
        def add_aria(match):
            button = match.group(1)
            if 'aria-label' not in button:
                button = button.replace('>', f' aria-label="{label}">', 1)
            return button
        content = re.sub(pattern, add_aria, content, flags=re.DOTALL)
    
    # Add ARIA labels to input fields
    content = re.sub(
        r'(<input[^>]*placeholder="([^"]*)"[^>]*)(>)',
        lambda m: f'{m.group(1)} aria-label="{m.group(2)}"{m.group(3)}' if 'aria-label' not in m.group(1) else m.group(0),
        content
    )
    
    # Add role attribute to main content
    content = re.sub(
        r'<main class="main-content" id="mainContent">',
        r'<main class="main-content" id="mainContent" role="main" aria-label="Story content">',
        content
    )
    
    # Add role attribute to navigation
    content = re.sub(
        r'<nav class="sidebar" id="sidebar">',
        r'<nav class="sidebar" id="sidebar" role="navigation" aria-label="Chapter navigation">',
        content
    )
    
    # Add role attribute to header
    content = re.sub(
        r'<header class="topbar">',
        r'<header class="topbar" role="banner">',
        content
    )
    
    # Write updated content
    with open('index.html', 'w') as f:
        f.write(content)
    
    print("✅ ARIA labels added successfully")
    print("✅ Accessibility improved")

if __name__ == "__main__":
    add_aria_labels()
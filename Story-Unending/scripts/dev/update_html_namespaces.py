#!/usr/bin/env python3
"""
Script to update index.html to use the new namespace structure.
"""

import re

def update_html_file():
    """Update index.html to use new namespace structure."""
    
    with open('index.html', 'r') as f:
        content = f.read()
    
    # Define namespace mappings
    replacements = [
        # Security functions
        (r'\bsanitizeHTML\s*\(', 'Security.sanitizeHTML('),
        (r'\bsanitizeAttribute\s*\(', 'Security.sanitizeAttribute('),
        (r'\bRateLimiter\.', 'Security.RateLimiter.'),
        (r'\bValidator\.', 'Security.Validator.'),
        (r'\bErrorHandler\.', 'Security.ErrorHandler.'),
        
        # Storage functions
        (r'\bgetUsers\s*\(', 'Storage.getUsers('),
        (r'\bsaveUsers\s*\(', 'Storage.saveUsers('),
        (r'\bgetUsedParagraphs\s*\(', 'Storage.getUsedParagraphs('),
        (r'\bsaveUsedParagraphs\s*\(', 'Storage.saveUsedParagraphs('),
        (r'\bgetChapterContent\s*\(', 'Storage.getChapterContent('),
        (r'\bsaveChapterContent\s*\(', 'Storage.saveChapterContent('),
        
        # UI Modals
        (r'\bopenModal\s*\(', 'UIModals.openModal('),
        (r'\bcloseModal\s*\(', 'UIModals.closeModal('),
        (r'\bcloseAllModals\s*\(', 'UIModals.closeAllModals('),
        
        # UI Dropdown
        (r'\btoggleDropdown\s*\(', 'UIDropdown.toggleDropdown('),
        (r'\bcloseDropdown\s*\(', 'UIDropdown.closeDropdown('),
        (r'\binitDropdownClose\s*\(', 'UIDropdown.initDropdownClose('),
        
        # UI Notifications
        (r'\bshowNotification\s*\(', 'UINotifications.showNotification('),
        
        # UI Sidebar
        (r'\baddSidebarItem\s*\(', 'UISidebar.addSidebarItem('),
        (r'\btoggleSidebar\s*\(', 'UISidebar.toggleSidebar('),
        (r'\bhandleSidebarJumpKey\s*\(', 'UISidebar.handleSidebarJumpKey('),
        (r'\bjumpToChapter\s*\(', 'UISidebar.jumpToChapter('),
        
        # UI Text Size
        (r'\bcurrentTextSize\b', 'UITextSize.currentTextSize'),
        (r'\bsetTextSize\s*\(', 'UITextSize.setTextSize('),
        (r'\bapplyTextSize\s*\(', 'UITextSize.applyTextSize('),
        (r'\bupdateTextSizeInput\s*\(', 'UITextSize.updateTextSizeInput('),
        (r'\bincreaseTextSize\s*\(', 'UITextSize.increaseTextSize('),
        (r'\bdecreaseTextSize\s*\(', 'UITextSize.decreaseTextSize('),
        (r'\bresetTextSize\s*\(', 'UITextSize.resetTextSize('),
        
        # UI Stats
        (r'\bupdateBadge\s*\(', 'UIStats.updateBadge('),
        (r'\bgetChapterStats\s*\(', 'UIStats.getChapterStats('),
        (r'\bupdateStatsBar\s*\(', 'UIStats.updateStatsBar('),
        
        # Auth
        (r'\blogin\s*\(', 'Auth.login('),
        (r'\bloginUser\s*\(', 'Auth.loginUser('),
        (r'\bregister\s*\(', 'Auth.register('),
        
        # Navigation
        (r'\bnextChapter\s*\(', 'Navigation.nextChapter('),
        (r'\bprevChapter\s*\(', 'Navigation.prevChapter('),
        
        # Admin
        (r'\bupdateAdminCredentialsScreen\s*\(', 'Admin.updateAdminCredentialsScreen('),
        (r'\btoggleUserManagementScreen\s*\(', 'Admin.toggleUserManagementScreen('),
        (r'\bfilterUsersScreen\s*\(', 'Admin.filterUsersScreen('),
        (r'\baddEmailToAccount\s*\(', 'Admin.addEmailToAccount('),
        
        # Generation
        (r'\bgetTotalChaptersShouldExist\s*\(', 'Generation.getTotalChaptersShouldExist('),
    ]
    
    # Apply replacements
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    # Backup original file
    with open('index.html.backup', 'w') as f:
        with open('index.html', 'r') as original:
            f.write(original.read())
    
    # Write updated content
    with open('index.html', 'w') as f:
        f.write(content)
    
    print("✓ Updated index.html with new namespace structure")
    print("  Backup saved to index.html.backup")
    print(f"  Applied {len(replacements)} replacement patterns")

if __name__ == '__main__':
    print("=== Updating HTML Namespaces ===\n")
    update_html_file()
    print("\n=== Update Complete ===")
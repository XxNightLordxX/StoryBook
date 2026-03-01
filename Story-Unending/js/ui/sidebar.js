/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Sidebar functionality and navigation
 * Extracted from index.html
 */


(function() {
  
  const addSidebarItem = (chapter) => {
    const list = DOMHelpers.safeGetElement('sidebarList');
    const item = document.createElement('div');
    item.className = 'sidebar-item';
    item.dataset.num = chapter.number;
    item.onclick = () => {
      showNotification(`Clicked chapter ${chapter.number}: ${chapter.title}`);
      showChapter(chapter.number);
      if (window.innerWidth < 768) toggleSidebar();
    };
    item.innerHTML = `
        <span class="sidebar-item-num">${chapter.number}</span>
        <span class="sidebar-item-title">${chapter.title}</span>
      `;
    list.appendChild(item);
  };

  const toggleSidebar = () => {
    AppState.sidebarOpen = !AppState.sidebarOpen;
    DOMHelpers.safeGetElement('sidebar').classList.toggle('open', AppState.sidebarOpen);
    DOMHelpers.safeGetElement('mainContent').classList.toggle('sidebar-open', AppState.sidebarOpen);
  };

  const handleSidebarJumpKey = (e) => {
    if (e.key === 'Enter') jumpToChapter();
  };

  const jumpToChapter = () => {
    showNotification(`jumpToChapter: Calling showChapter(${chapterNum})`);
    showChapter(chapterNum);
    input.value = '';

    // Close sidebar on mobile
    if (window.innerWidth < 768) toggleSidebar();
  };

  DOMHelpers.safeGetElement('sidebarToggle').addEventListener('click', toggleSidebar);

  // Create namespace object
  const UISidebar = {
    addSidebarItem: addSidebarItem,
    toggleSidebar: toggleSidebar,
    handleSidebarJumpKey: handleSidebarJumpKey,
    jumpToChapter: jumpToChapter
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.UISidebar = UISidebar;
    window.addSidebarItem = addSidebarItem;
    window.toggleSidebar = toggleSidebar;
    window.handleSidebarJumpKey = handleSidebarJumpKey;
    window.jumpToChapter = jumpToChapter;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UISidebar;
  }
})();
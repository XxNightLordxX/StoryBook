(function() {
  /**
* Admin panel and user management
* Extracted from index.html
*/

    const updateAdminCredentialsScreen = () => {
      updateAdminCredentials();
    }

    const toggleUserManagementScreen = () => {
      toggleUserManagement();
    }

    const filterUsersScreen = () => {
      filterUsers();
    }

  
  // Create namespace object
  const Admin = {
  updateAdminCredentialsScreen: updateAdminCredentialsScreen,
  toggleUserManagementScreen: toggleUserManagementScreen,
  filterUsersScreen: filterUsersScreen,
  Admin: Admin
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.Admin = Admin;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Admin;
  }
})();
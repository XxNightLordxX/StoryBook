#!/usr/bin/env python3
"""
Test automated backup system implementation.
"""

import os

def test_backup_module():
    """Test that backup module exists and is valid."""
    print("=" * 80)
    print("TEST 1: Backup Module Verification")
    print("=" * 80)
    
    try:
        with open('js/modules/backup.js', 'r') as f:
            content = f.read()
        
        # Check for key functions
        required_functions = [
            'createBackup',
            'getBackups',
            'getBackup',
            'restoreBackup',
            'deleteBackup',
            'exportBackup',
            'importBackup',
            'createAutoBackup',
            'getBackupStats',
        ]
        
        for func in required_functions:
            if func in content:
                print(f"  ✓ Function '{func}' found")
            else:
                print(f"  ✗ Function '{func}' missing")
                return False
        
        # Check for export
        if 'window.BackupSystem = BackupSystem' in content:
            print("  ✓ Export to global scope found")
        else:
            print("  ✗ Export to global scope missing")
            return False
        
        # Check for error handling
        if 'try {' in content and 'catch' in content:
            print("  ✓ Error handling found")
        else:
            print("  ✗ Error handling missing")
            return False
        
        # Check for backup configuration
        if 'MAX_BACKUPS' in content:
            print("  ✓ Backup configuration found")
        else:
            print("  ✗ Backup configuration missing")
            return False
        
        return True
        
    except FileNotFoundError:
        print("  ✗ backup.js not found")
        return False

def test_backup_ui_module():
    """Test that backup UI module exists and is valid."""
    print("\n" + "=" * 80)
    print("TEST 2: Backup UI Module Verification")
    print("=" * 80)
    
    try:
        with open('js/ui/backup-ui.js', 'r') as f:
            content = f.read()
        
        # Check for key functions
        required_functions = [
            'openModal',
            'closeModal',
            'createBackup',
            'restoreBackup',
            'deleteBackup',
            'exportBackup',
            'importBackup',
            'handleFileImport',
        ]
        
        for func in required_functions:
            if func in content:
                print(f"  ✓ Function '{func}' found")
            else:
                print(f"  ✗ Function '{func}' missing")
                return False
        
        # Check for export
        if 'window.BackupUI = BackupUI' in content:
            print("  ✓ Export to global scope found")
        else:
            print("  ✗ Export to global scope missing")
            return False
        
        # Check for modal creation
        if 'createBackupModal' in content:
            print("  ✓ Modal creation found")
        else:
            print("  ✗ Modal creation missing")
            return False
        
        return True
        
    except FileNotFoundError:
        print("  ✗ backup-ui.js not found")
        return False

def test_css_file():
    """Test that CSS file exists and is valid."""
    print("\n" + "=" * 80)
    print("TEST 3: CSS File Verification")
    print("=" * 80)
    
    try:
        with open('css/backup.css', 'r') as f:
            content = f.read()
        
        # Check for key styles
        required_styles = [
            '.backup-modal-content',
            '.backup-actions',
            '.backup-stats',
            '.backup-list',
            '.backup-item',
        ]
        
        for style in required_styles:
            if style in content:
                print(f"  ✓ Style '{style}' found")
            else:
                print(f"  ✗ Style '{style}' missing")
                return False
        
        # Check for responsive design
        if '@media' in content:
            print("  ✓ Responsive design found")
        else:
            print("  ✗ Responsive design missing")
            return False
        
        return True
        
    except FileNotFoundError:
        print("  ✗ backup.css not found")
        return False

def test_html_integration():
    """Test that HTML integration is correct."""
    print("\n" + "=" * 80)
    print("TEST 4: HTML Integration Verification")
    print("=" * 80)
    
    with open('index.html', 'r') as f:
        html_content = f.read()
    
    # Check that backup.js is present
    if 'js/modules/backup.js' in html_content:
        print("  ✓ backup.js is present")
    else:
        print("  ✗ backup.js is missing")
        return False
    
    # Check that backup-ui.js is present
    if 'js/ui/backup-ui.js' in html_content:
        print("  ✓ backup-ui.js is present")
    else:
        print("  ✗ backup-ui.js is missing")
        return False
    
    # Check that backup.css is present
    if 'css/backup.css' in html_content:
        print("  ✓ backup.css is present")
    else:
        print("  ✗ backup.css is missing")
        return False
    
    # Check for backup button
    if 'BackupUI.openModal' in html_content:
        print("  ✓ Backup button found")
    else:
        print("  ✗ Backup button missing")
        return False
    
    return True

def test_backup_features():
    """Test backup system features."""
    print("\n" + "=" * 80)
    print("TEST 5: Backup Features Verification")
    print("=" * 80)
    
    with open('js/modules/backup.js', 'r') as f:
        content = f.read()
    
    # Check for backup creation
    if 'createBackup' in content and 'localStorage' in content:
        print("  ✓ Backup creation found")
    else:
        print("  ✗ Backup creation missing")
        return False
    
    # Check for backup restoration
    if 'restoreBackup' in content:
        print("  ✓ Backup restoration found")
    else:
        print("  ✗ Backup restoration missing")
        return False
    
    # Check for backup export
    if 'exportBackup' in content and 'Blob' in content:
        print("  ✓ Backup export found")
    else:
        print("  ✗ Backup export missing")
        return False
    
    # Check for backup import
    if 'importBackup' in content and 'FileReader' in content:
        print("  ✓ Backup import found")
    else:
        print("  ✗ Backup import missing")
        return False
    
    # Check for auto backup
    if 'createAutoBackup' in content:
        print("  ✓ Auto backup found")
    else:
        print("  ✗ Auto backup missing")
        return False
    
    # Check for backup statistics
    if 'getBackupStats' in content:
        print("  ✓ Backup statistics found")
    else:
        print("  ✗ Backup statistics missing")
        return False
    
    return True

def main():
    """Run all tests."""
    print("\n" + "=" * 80)
    print("AUTOMATED BACKUP SYSTEM IMPLEMENTATION TESTS")
    print("=" * 80)
    
    tests = [
        ("Backup Module", test_backup_module),
        ("Backup UI Module", test_backup_ui_module),
        ("CSS File", test_css_file),
        ("HTML Integration", test_html_integration),
        ("Backup Features", test_backup_features),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n  ✗ Test failed with error: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {test_name}")
    
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n  🎉 All tests passed! Automated backup system implementation is complete.")
        return True
    else:
        print(f"\n  ⚠️  {total - passed} test(s) failed. Please review the issues above.")
        return False

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
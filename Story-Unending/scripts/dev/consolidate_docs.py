#!/usr/bin/env python3
"""
Analyze and consolidate documentation
Keep only essential information for improving the website
"""
import os
from pathlib import Path

def analyze_document(filepath):
    """Analyze a document to determine if it should be kept"""
    filename = filepath.name.lower()
    
    # KEEP: Essential documents
    essential_keep = [
        'readme.md',
        'api_documentation.md',
        'branching_narrative_design.md',
        'dynamic_content_design.md',
        'content_documentation.md',
        'remaining_enhancements.md',
        'consolidated_enhancements.md',
        'consolidated_recommendations.md',
    ]
    
    # DELETE: Completed reports (already done, no longer needed)
    delete_patterns = [
        'report',  # All task reports, phase reports, final reports
        'complete',  # Completion reports
        'summary',  # Summary reports
        'analysis',  # Analysis reports (except content analysis)
        'inventory',  # File inventory
        'findings',  # Code review findings
        'status',  # Implementation status
        'optimization',  # Optimization reports
        'project_analysis',  # Project analysis
        'global_variables',  # Global variables analysis
        'feature_gaps',  # Feature gaps (now in remaining enhancements)
        'all_recommendations_extracted',  # Raw extraction
        'recommendations.md',  # Old recommendations (superseded by consolidated)
        'optimization-plan',  # Optimization plan
        'documentation_organization',  # Organization summary
        'test',  # All test reports
        'verification',  # Verification reports
        'checklist',  # Checklists
        'plan',  # Test plans
    ]
    
    # Check if it's essential
    if filename in essential_keep:
        return 'KEEP'
    
    # Check if it should be deleted
    for pattern in delete_patterns:
        if pattern in filename:
            return 'DELETE'
    
    # Default to review
    return 'REVIEW'

def main():
    docs_dir = Path('/workspace/docs')
    
    keep_files = []
    delete_files = []
    review_files = []
    
    for md_file in docs_dir.rglob('*.md'):
        decision = analyze_document(md_file)
        relative_path = md_file.relative_to(docs_dir)
        
        if decision == 'KEEP':
            keep_files.append(relative_path)
        elif decision == 'DELETE':
            delete_files.append(relative_path)
        else:
            review_files.append(relative_path)
    
    print("=" * 80)
    print("DOCUMENTATION CONSOLIDATION ANALYSIS")
    print("=" * 80)
    print(f"\n📊 Total Files: {len(keep_files) + len(delete_files) + len(review_files)}")
    print(f"\n✅ KEEP ({len(keep_files)} files):")
    for f in sorted(keep_files):
        print(f"   - {f}")
    
    print(f"\n🗑️  DELETE ({len(delete_files)} files):")
    for f in sorted(delete_files):
        print(f"   - {f}")
    
    print(f"\n🔍 REVIEW ({len(review_files)} files):")
    for f in sorted(review_files):
        print(f"   - {f}")
    
    print("\n" + "=" * 80)
    print("RECOMMENDATION:")
    print("=" * 80)
    print("The following files should be kept as they contain essential information:")
    print("- README.md: Project overview and getting started")
    print("- API_DOCUMENTATION.md: API reference for developers")
    print("- DESIGN_DOCS: System architecture and design decisions")
    print("- REMAINING_ENHANCEMENTS.md: Future improvements")
    print("- CONSOLIDATED_ENHANCEMENTS.md: Enhancement ideas")
    print("- CONSOLIDATED_RECOMMENDATIONS.md: Actionable recommendations")
    print("\nAll other files are completed reports that can be safely deleted.")

if __name__ == '__main__':
    main()
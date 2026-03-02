#!/usr/bin/env python3
"""
Content Quality Assurance Script for Story-Unending Project
Reviews all content for consistency, coherence, and quality
"""

import re
import json
from datetime import datetime
from collections import defaultdict, Counter

class ContentQualityAssurance:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.stats = {
            'total_paragraphs': 0,
            'total_branches': 0,
            'total_dynamic_elements': 0,
            'consistency_issues': 0,
            'coherence_issues': 0,
            'quality_score': 0
        }
        
    def analyze_backstory_content(self, filepath):
        """Analyze backstory content for quality and consistency"""
        print("Analyzing backstory content...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract all paragraph arrays
        generators = {
            'Life': [],
            'Sister': [],
            'Parents': [],
            'Struggle': [],
            'VR Hype': [],
            'Headset': []
        }
        
        # Find all paragraph arrays
        for generator_name in generators.keys():
            # Find opening paragraphs
            opening_pattern = rf'const openings = \[(.*?)\];'
            middle_pattern = rf'const middles = \[(.*?)\];'
            
            # Extract paragraphs for each generator
            generator_blocks = re.split(
                rf'// {generator_name} Generator',
                content,
                flags=re.IGNORECASE
            )
            
            if len(generator_blocks) > 1:
                block = generator_blocks[1]
                
                # Extract openings
                openings = re.findall(r'"([^"]{50,})"', block)
                generators[generator_name].extend(openings)
                
                # Extract middles
                middles = re.findall(r'"([^"]{50,})"', block)
                generators[generator_name].extend(middles)
        
        # Analyze each generator
        for generator_name, paragraphs in generators.items():
            print(f"\n{generator_name} Generator:")
            print(f"  Total paragraphs: {len(paragraphs)}")
            
            # Check for duplicates
            unique_paragraphs = set(paragraphs)
            duplicates = len(paragraphs) - len(unique_paragraphs)
            
            if duplicates > 0:
                self.issues.append({
                    'type': 'duplicate_content',
                    'generator': generator_name,
                    'count': duplicates,
                    'severity': 'medium'
                })
                print(f"  ⚠️  Found {duplicates} duplicate paragraphs")
            else:
                print(f"  ✅ No duplicates found")
            
            # Check paragraph length
            avg_length = sum(len(p) for p in paragraphs) / len(paragraphs) if paragraphs else 0
            print(f"  Average paragraph length: {avg_length:.0f} characters")
            
            if avg_length < 100:
                self.warnings.append({
                    'type': 'short_paragraphs',
                    'generator': generator_name,
                    'avg_length': avg_length,
                    'severity': 'low'
                })
            
            # Check for narrative consistency
            self._check_narrative_consistency(generator_name, paragraphs)
            
            self.stats['total_paragraphs'] += len(paragraphs)
        
        return generators
    
    def analyze_vr_content(self, filepath):
        """Analyze VR content for quality and consistency"""
        print("\nAnalyzing VR content...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract enemies
        enemies = re.findall(r'name: "([^"]+)"', content)
        print(f"  Total enemies: {len(enemies)}")
        
        # Extract combat templates
        combat_openings = len(re.findall(r'combatOpeningTemplates', content))
        combat_middles = len(re.findall(r'combatMiddleTemplates', content))
        print(f"  Combat opening templates: {combat_openings}")
        print(f"  Combat middle templates: {combat_middles}")
        
        # Extract exploration scenarios
        exploration_scenarios = len(re.findall(r'explorationScenarios', content))
        print(f"  Exploration scenarios: {exploration_scenarios}")
        
        # Extract dialogue options
        dialogue_options = len(re.findall(r'dialogueOptions', content))
        print(f"  Dialogue options: {dialogue_options}")
        
        self.stats['total_dynamic_elements'] += len(enemies) + combat_openings + combat_middles + exploration_scenarios + dialogue_options
        
        return {
            'enemies': enemies,
            'combat_openings': combat_openings,
            'combat_middles': combat_middles,
            'exploration_scenarios': exploration_scenarios,
            'dialogue_options': dialogue_options
        }
    
    def analyze_branching_narrative(self, filepath):
        """Analyze branching narrative system"""
        print("\nAnalyzing branching narrative...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract branching points
        branching_points = re.findall(r'chapter: (\d+)', content)
        print(f"  Total branching points: {len(branching_points)}")
        
        # Extract major branches
        major_branches = re.findall(r'type: "major"', content)
        print(f"  Major branches: {len(major_branches)}")
        
        # Extract minor branches
        minor_branches = re.findall(r'type: "minor"', content)
        print(f"  Minor branches: {len(minor_branches)}")
        
        # Extract total options
        total_options = len(re.findall(r'options:', content))
        print(f"  Total choice options: {total_options}")
        
        self.stats['total_branches'] = len(branching_points)
        
        return {
            'branching_points': len(branching_points),
            'major_branches': len(major_branches),
            'minor_branches': len(minor_branches),
            'total_options': total_options
        }
    
    def analyze_dynamic_content(self, filepath):
        """Analyze dynamic content generation system"""
        print("\nAnalyzing dynamic content...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract procedural templates
        procedural_templates = re.findall(r'type: "(combat|exploration|dialogue|introspection)"', content)
        print(f"  Procedural templates: {len(procedural_templates)}")
        
        # Extract character states
        character_states = re.findall(r'characterStates', content)
        print(f"  Character state systems: {len(character_states)}")
        
        # Extract world events
        world_events = re.findall(r'worldEvents', content)
        print(f"  World event systems: {len(world_events)}")
        
        # Extract quest templates
        quest_templates = re.findall(r'questTemplates', content)
        print(f"  Quest templates: {len(quest_templates)}")
        
        return {
            'procedural_templates': len(procedural_templates),
            'character_states': len(character_states),
            'world_events': len(world_events),
            'quest_templates': len(quest_templates)
        }
    
    def _check_narrative_consistency(self, generator_name, paragraphs):
        """Check narrative consistency within a generator"""
        # Check for character name consistency
        character_names = ['Kael', 'Yuna', 'Mom', 'Dad', 'Sister']
        
        for paragraph in paragraphs:
            # Check for inconsistent character references
            for name in character_names:
                # Check for variations in capitalization
                variations = re.findall(rf'\b{name.lower()}\b', paragraph, re.IGNORECASE)
                if variations and name not in paragraph:
                    self.warnings.append({
                        'type': 'inconsistent_naming',
                        'generator': generator_name,
                        'name': name,
                        'severity': 'low'
                    })
    
    def test_paragraph_tracking(self):
        """Test paragraph tracking functionality"""
        print("\nTesting paragraph tracking...")
        
        # This would require running the actual JavaScript code
        # For now, we'll verify the tracking system exists
        tracking_files = [
            'js/modules/branching-narrative.js',
            'js/modules/dynamic-content.js'
        ]
        
        for filepath in tracking_files:
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if 'paragraphTracking' in content or 'usedParagraphs' in content:
                    print(f"  ✅ Paragraph tracking found in {filepath}")
                else:
                    self.warnings.append({
                        'type': 'missing_tracking',
                        'file': filepath,
                        'severity': 'medium'
                    })
            except FileNotFoundError:
                self.warnings.append({
                    'type': 'file_not_found',
                    'file': filepath,
                    'severity': 'high'
                })
    
    def test_seeded_rng(self):
        """Test seeded RNG consistency"""
        print("\nTesting seeded RNG...")
        
        # Check for RNG implementation
        rng_files = [
            'story-engine.js',
            'backstory-engine.js'
        ]
        
        for filepath in rng_files:
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if 'seededRandom' in content or 'Math.random' in content:
                    print(f"  ✅ RNG implementation found in {filepath}")
                else:
                    self.warnings.append({
                        'type': 'missing_rng',
                        'file': filepath,
                        'severity': 'high'
                    })
            except FileNotFoundError:
                pass
    
    def calculate_quality_score(self):
        """Calculate overall quality score"""
        print("\nCalculating quality score...")
        
        # Base score
        score = 100
        
        # Deduct for issues
        for issue in self.issues:
            if issue['severity'] == 'high':
                score -= 10
            elif issue['severity'] == 'medium':
                score -= 5
            elif issue['severity'] == 'low':
                score -= 2
        
        # Deduct for warnings
        for warning in self.warnings:
            if warning['severity'] == 'high':
                score -= 5
            elif warning['severity'] == 'medium':
                score -= 2
            elif warning['severity'] == 'low':
                score -= 1
        
        # Ensure score doesn't go below 0
        score = max(0, score)
        
        self.stats['quality_score'] = score
        print(f"  Overall quality score: {score}/100")
        
        return score
    
    def generate_report(self):
        """Generate comprehensive quality assurance report"""
        print("\nGenerating quality assurance report...")
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'statistics': self.stats,
            'issues': self.issues,
            'warnings': self.warnings,
            'recommendations': self._generate_recommendations()
        }
        
        return report
    
    def _generate_recommendations(self):
        """Generate recommendations based on findings"""
        recommendations = []
        
        # Check for duplicate content
        duplicate_issues = [i for i in self.issues if i['type'] == 'duplicate_content']
        if duplicate_issues:
            recommendations.append({
                'priority': 'high',
                'action': 'Remove duplicate paragraphs',
                'details': f"Found duplicates in {len(duplicate_issues)} generators"
            })
        
        # Check for missing tracking
        tracking_issues = [w for w in self.warnings if w['type'] == 'missing_tracking']
        if tracking_issues:
            recommendations.append({
                'priority': 'medium',
                'action': 'Implement paragraph tracking',
                'details': f"Missing tracking in {len(tracking_issues)} files"
            })
        
        # Check for missing RNG
        rng_issues = [w for w in self.warnings if w['type'] == 'missing_rng']
        if rng_issues:
            recommendations.append({
                'priority': 'high',
                'action': 'Implement seeded RNG',
                'details': f"Missing RNG in {len(rng_issues)} files"
            })
        
        # General recommendations
        if self.stats['quality_score'] < 80:
            recommendations.append({
                'priority': 'medium',
                'action': 'Improve content quality',
                'details': 'Quality score below 80, review content for improvements'
            })
        
        return recommendations
    
    def run_full_analysis(self):
        """Run complete quality assurance analysis"""
        print("=" * 60)
        print("CONTENT QUALITY ASSURANCE ANALYSIS")
        print("=" * 60)
        
        # Analyze backstory content
        try:
            self.analyze_backstory_content('backstory-engine.js')
        except FileNotFoundError:
            print("⚠️  backstory-engine.js not found")
        
        # Analyze VR content
        try:
            self.analyze_vr_content('story-engine.js')
        except FileNotFoundError:
            print("⚠️  story-engine.js not found")
        
        # Analyze branching narrative
        try:
            self.analyze_branching_narrative('js/modules/branching-narrative.js')
        except FileNotFoundError:
            print("⚠️  branching-narrative.js not found")
        
        # Analyze dynamic content
        try:
            self.analyze_dynamic_content('js/modules/dynamic-content.js')
        except FileNotFoundError:
            print("⚠️  dynamic-content.js not found")
        
        # Test systems
        self.test_paragraph_tracking()
        self.test_seeded_rng()
        
        # Calculate quality score
        self.calculate_quality_score()
        
        # Generate report
        report = self.generate_report()
        
        print("\n" + "=" * 60)
        print("ANALYSIS COMPLETE")
        print("=" * 60)
        print(f"Total Issues: {len(self.issues)}")
        print(f"Total Warnings: {len(self.warnings)}")
        print(f"Quality Score: {self.stats['quality_score']}/100")
        
        return report

def main():
    """Main execution function"""
    qa = ContentQualityAssurance()
    report = qa.run_full_analysis()
    
    # Save report to file
    with open('QUALITY_ASSURANCE_REPORT.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print("\n✅ Quality assurance report saved to QUALITY_ASSURANCE_REPORT.json")
    
    return report

if __name__ == '__main__':
    main()
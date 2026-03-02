#!/usr/bin/env python3
"""
Generate 5000 chapters and check for:
1. Exact duplicate chapters (same title + same paragraphs)
2. Exact duplicate paragraphs across chapters
3. Near-duplicate paragraphs (high similarity)
4. Chapter generation errors
5. Empty chapters or missing content
6. Word count consistency
"""

import subprocess
import json
import sys
import hashlib
from collections import Counter, defaultdict

def run_chapter_test():
    # Create a Node.js script to generate 5000 chapters
    node_script = '''
const fs = require('fs');

// Load the engines
const storyEngineCode = fs.readFileSync('story-engine.js', 'utf8');
const backstoryEngineCode = fs.readFileSync('backstory-engine.js', 'utf8');

// Execute in a sandboxed context
const vm = require('vm');
const context = vm.createContext({
    console: console,
    Math: Math,
    Date: Date,
    JSON: JSON,
    Set: Set,
    Map: Map,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    Error: Error,
    RegExp: RegExp,
    Promise: Promise,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    window: {},
    document: { addEventListener: () => {} }
});

try {
    // Execute backstory engine first
    vm.runInContext(backstoryEngineCode, context);
    // Then story engine
    vm.runInContext(storyEngineCode, context);
    
    const StoryEngine = context.StoryEngine;
    
    if (!StoryEngine) {
        console.error('StoryEngine not found in context');
        process.exit(1);
    }
    
    const chapters = [];
    const errors = [];
    
    for (let i = 1; i <= 5000; i++) {
        try {
            const chapter = StoryEngine.generateChapter();
            chapters.push({
                number: chapter.number,
                title: chapter.title,
                type: chapter.type,
                setting: chapter.setting,
                arc: chapter.arc,
                wordCount: chapter.wordCount,
                paragraphCount: chapter.paragraphs ? chapter.paragraphs.length : 0,
                paragraphs: chapter.paragraphs || [],
                location: chapter.location
            });
            
            if (i % 500 === 0) {
                process.stderr.write('Generated ' + i + '/5000 chapters\\n');
            }
        } catch (e) {
            errors.push({
                chapter: i,
                error: e.message,
                stack: e.stack ? e.stack.substring(0, 200) : ''
            });
        }
    }
    
    // Output results
    const output = {
        totalChapters: chapters.length,
        totalErrors: errors.length,
        errors: errors,
        chapters: chapters
    };
    
    // Write to file (too large for stdout)
    fs.writeFileSync('outputs/chapter_test_results.json', JSON.stringify(output));
    console.log(JSON.stringify({
        totalChapters: chapters.length,
        totalErrors: errors.length,
        errorSummary: errors.slice(0, 10)
    }));
    
} catch (e) {
    console.error('Fatal error:', e.message);
    console.error(e.stack);
    process.exit(1);
}
'''
    
    with open('scripts/gen_5000.js', 'w') as f:
        f.write(node_script)
    
    print("Generating 5000 chapters...")
    result = subprocess.run(['node', 'scripts/gen_5000.js'], 
                          capture_output=True, text=True, timeout=300)
    
    if result.returncode != 0:
        print("ERROR generating chapters:")
        print(result.stderr[:1000])
        print(result.stdout[:1000])
        return False
    
    print(result.stderr.strip())
    
    try:
        summary = json.loads(result.stdout)
        print("Generated: %d chapters, %d errors" % (summary['totalChapters'], summary['totalErrors']))
        if summary['totalErrors'] > 0:
            print("Errors:")
            for err in summary['errorSummary']:
                print("  Chapter %d: %s" % (err['chapter'], err['error']))
    except:
        print("Output: %s" % result.stdout[:500])
    
    return True

def analyze_chapters():
    print("\n" + "="*60)
    print("ANALYZING 5000 CHAPTERS FOR DUPLICATES")
    print("="*60)
    
    with open('outputs/chapter_test_results.json', 'r') as f:
        data = json.load(f)
    
    chapters = data['chapters']
    errors = data['errors']
    
    print("\n--- BASIC STATS ---")
    print("Total chapters: %d" % len(chapters))
    print("Total errors: %d" % len(errors))
    
    if errors:
        print("\nERRORS:")
        for err in errors[:20]:
            print("  Chapter %d: %s" % (err['chapter'], err['error'][:100]))
    
    # Check for empty chapters
    empty_chapters = [c for c in chapters if c['paragraphCount'] == 0]
    print("\nEmpty chapters (0 paragraphs): %d" % len(empty_chapters))
    if empty_chapters:
        for c in empty_chapters[:10]:
            print("  Chapter %d: %s" % (c['number'], c['title']))
    
    # Check word counts
    word_counts = [c['wordCount'] for c in chapters]
    if word_counts:
        avg_wc = sum(word_counts) / len(word_counts)
        min_wc = min(word_counts)
        max_wc = max(word_counts)
        short_chapters = [c for c in chapters if c['wordCount'] < 200]
        print("\n--- WORD COUNTS ---")
        print("Average: %.0f words" % avg_wc)
        print("Min: %d words" % min_wc)
        print("Max: %d words" % max_wc)
        print("Short chapters (<200 words): %d" % len(short_chapters))
        if short_chapters:
            for c in short_chapters[:10]:
                print("  Chapter %d: %d words (%s)" % (c['number'], c['wordCount'], c['type']))
    
    # 1. Check for exact duplicate chapters (same title AND same content)
    print("\n--- EXACT DUPLICATE CHAPTERS ---")
    chapter_hashes = {}
    exact_dupes = []
    for c in chapters:
        content_hash = hashlib.md5(('\n'.join(c['paragraphs'])).encode()).hexdigest()
        key = "%s|%s" % (c['title'], content_hash)
        if key in chapter_hashes:
            exact_dupes.append((c['number'], chapter_hashes[key], c['title']))
        else:
            chapter_hashes[key] = c['number']
    
    print("Exact duplicate chapters: %d" % len(exact_dupes))
    if exact_dupes:
        for dup in exact_dupes[:20]:
            print("  Chapter %d is duplicate of Chapter %d: '%s'" % (dup[0], dup[1], dup[2]))
    
    # 2. Check for duplicate titles
    print("\n--- DUPLICATE TITLES ---")
    title_counts = Counter(c['title'] for c in chapters)
    dup_titles = {t: cnt for t, cnt in title_counts.items() if cnt > 1}
    print("Unique titles: %d / %d" % (len(title_counts), len(chapters)))
    print("Duplicate titles: %d" % len(dup_titles))
    if dup_titles:
        for title, cnt in sorted(dup_titles.items(), key=lambda x: -x[1])[:20]:
            print("  '%s' appears %d times" % (title, cnt))
    
    # 3. Check for exact duplicate paragraphs across chapters
    print("\n--- DUPLICATE PARAGRAPHS ACROSS CHAPTERS ---")
    para_locations = defaultdict(list)
    total_paras = 0
    for c in chapters:
        for p in c['paragraphs']:
            p_hash = hashlib.md5(p.encode()).hexdigest()
            para_locations[p_hash].append(c['number'])
            total_paras += 1
    
    dup_paras = {h: locs for h, locs in para_locations.items() if len(locs) > 1}
    print("Total paragraphs: %d" % total_paras)
    print("Unique paragraphs: %d" % len(para_locations))
    print("Paragraphs appearing in multiple chapters: %d" % len(dup_paras))
    
    # Show worst offenders
    if dup_paras:
        worst = sorted(dup_paras.items(), key=lambda x: -len(x[1]))[:15]
        for h, locs in worst:
            # Find the actual text
            for c in chapters:
                for p in c['paragraphs']:
                    if hashlib.md5(p.encode()).hexdigest() == h:
                        print("  Appears in %d chapters: '%s...'" % (len(locs), p[:80]))
                        break
                else:
                    continue
                break
    
    # 4. Check for duplicate paragraphs WITHIN same chapter
    print("\n--- DUPLICATE PARAGRAPHS WITHIN CHAPTERS ---")
    intra_dupes = 0
    intra_dupe_chapters = []
    for c in chapters:
        seen = set()
        for p in c['paragraphs']:
            if p in seen:
                intra_dupes += 1
                if c['number'] not in [x[0] for x in intra_dupe_chapters]:
                    intra_dupe_chapters.append((c['number'], p[:60]))
            seen.add(p)
    
    print("Chapters with internal duplicates: %d" % len(intra_dupe_chapters))
    print("Total internal duplicate paragraphs: %d" % intra_dupes)
    if intra_dupe_chapters:
        for num, text in intra_dupe_chapters[:20]:
            print("  Chapter %d: '%s...'" % (num, text))
    
    # 5. Check chapter type distribution
    print("\n--- CHAPTER TYPE DISTRIBUTION ---")
    type_counts = Counter(c['type'] for c in chapters)
    for t, cnt in sorted(type_counts.items(), key=lambda x: -x[1]):
        print("  %-25s %4d (%.1f%%)" % (t, cnt, 100*cnt/len(chapters)))
    
    # 6. Check arc distribution
    print("\n--- ARC DISTRIBUTION ---")
    arc_counts = Counter(c['arc'] for c in chapters)
    for a, cnt in sorted(arc_counts.items(), key=lambda x: -x[1])[:20]:
        print("  %-35s %4d" % (a, cnt))
    
    # 7. Near-duplicate detection (paragraphs with >90% word overlap)
    print("\n--- NEAR-DUPLICATE PARAGRAPH CHECK (sampling) ---")
    # Sample paragraphs for near-duplicate check (full check would be too slow)
    all_paras = []
    for c in chapters:
        for p in c['paragraphs']:
            if len(p) > 50:  # Skip very short paragraphs
                all_paras.append((c['number'], p))
    
    # Sample 2000 paragraphs for comparison
    import random
    random.seed(42)
    sample_size = min(2000, len(all_paras))
    sample = random.sample(all_paras, sample_size)
    
    near_dupes = 0
    for i in range(len(sample)):
        words_i = set(sample[i][1].lower().split())
        for j in range(i+1, min(i+50, len(sample))):  # Compare with nearby samples
            words_j = set(sample[j][1].lower().split())
            if len(words_i) > 5 and len(words_j) > 5:
                overlap = len(words_i & words_j)
                similarity = overlap / max(len(words_i), len(words_j))
                if similarity > 0.9 and sample[i][1] != sample[j][1]:
                    near_dupes += 1
                    if near_dupes <= 5:
                        print("  Ch%d vs Ch%d (%.0f%% similar):" % (sample[i][0], sample[j][0], similarity*100))
                        print("    A: '%s...'" % sample[i][1][:70])
                        print("    B: '%s...'" % sample[j][1][:70])
    
    print("Near-duplicates found in sample: %d" % near_dupes)
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    issues = []
    if errors:
        issues.append("%d generation errors" % len(errors))
    if empty_chapters:
        issues.append("%d empty chapters" % len(empty_chapters))
    if short_chapters:
        issues.append("%d short chapters (<200 words)" % len(short_chapters))
    if exact_dupes:
        issues.append("%d exact duplicate chapters" % len(exact_dupes))
    if intra_dupe_chapters:
        issues.append("%d chapters with internal duplicates" % len(intra_dupe_chapters))
    if len(dup_paras) > len(chapters) * 0.1:
        issues.append("%d paragraphs reused across chapters" % len(dup_paras))
    
    if issues:
        print("ISSUES FOUND:")
        for issue in issues:
            print("  ❌ %s" % issue)
    else:
        print("✅ No significant issues found!")
    
    return {
        'errors': len(errors),
        'empty_chapters': len(empty_chapters),
        'short_chapters': len(short_chapters),
        'exact_dupes': len(exact_dupes),
        'dup_titles': len(dup_titles),
        'dup_paras_across': len(dup_paras),
        'intra_dupes': len(intra_dupe_chapters),
        'near_dupes': near_dupes,
        'issues': issues
    }

if __name__ == '__main__':
    if run_chapter_test():
        results = analyze_chapters()
        
        # Save results
        with open('outputs/chapter_analysis_results.json', 'w') as f:
            json.dump(results, f, indent=2)
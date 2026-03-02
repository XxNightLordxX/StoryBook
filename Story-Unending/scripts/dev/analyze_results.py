#!/usr/bin/env python3
"""Analyze the 5000 chapter test results"""

import json
from collections import Counter, defaultdict

with open('outputs/chapter_test_results.json', 'r') as f:
    data = json.load(f)

chapters = data['chapters']
total = len(chapters)

print(f"Total chapters: {total}")
print(f"Total errors: {data['totalErrors']}")

# Check for empty chapters
empty = [c for c in chapters if not c.get('paragraphs') or len(c['paragraphs']) == 0]
print(f"Empty chapters: {len(empty)}")

# Check word counts
word_counts = [c.get('wordCount', 0) for c in chapters]
print(f"Word count - Min: {min(word_counts)}, Max: {max(word_counts)}, Avg: {sum(word_counts)/len(word_counts):.1f}")

short = [c for c in chapters if c.get('wordCount', 0) < 200]
print(f"Short chapters (<200 words): {len(short)}")

# Check for duplicate titles
titles = [c.get('title', '') for c in chapters]
title_counts = Counter(titles)
dup_titles = [(t, c) for t, c in title_counts.items() if c > 1]
print(f"Duplicate titles: {len(dup_titles)}")
if dup_titles:
    print(f"  Most common: {dup_titles[0][0]} ({dup_titles[0][1]} times)")

# Check for duplicate paragraphs
all_paras = []
for c in chapters:
    for p in c.get('paragraphs', []):
        all_paras.append(p)

print(f"Total paragraphs: {len(all_paras)}")
print(f"Unique paragraphs: {len(set(all_paras))}")

# Count paragraph usage
para_counts = Counter(all_paras)
dup_paras = [(p, c) for p, c in para_counts.items() if c > 1]
print(f"Duplicate paragraphs: {len(dup_paras)}")

# Count paragraphs used in 21+ chapters
high_dup = [(p, c) for p, c in para_counts.items() if c >= 21]
print(f"Paragraphs used in 21+ chapters: {len(high_dup)}")

# Check for exact duplicate chapters
chapter_signatures = []
for c in chapters:
    sig = (c.get('title', ''), tuple(c.get('paragraphs', [])))
    chapter_signatures.append(sig)

sig_counts = Counter(chapter_signatures)
dup_chapters = [(s, c) for s, c in sig_counts.items() if c > 1]
print(f"Exact duplicate chapters: {len(dup_chapters)}")

# Check for internal paragraph duplicates (same paragraph appearing twice in one chapter)
intra_dupes = 0
for c in chapters:
    paras = c.get('paragraphs', [])
    if len(paras) != len(set(paras)):
        intra_dupes += 1
print(f"Chapters with internal duplicates: {intra_dupes}")

print("\n" + "="*60)
print("ISSUES FOUND:")
print("="*60)
issues = []
if len(short) > 0:
    issues.append(f"{len(short)} short chapters (<200 words)")
if len(dup_titles) > 0:
    issues.append(f"{len(dup_titles)} duplicate titles")
if len(high_dup) > 0:
    issues.append(f"{len(high_dup)} paragraphs reused in 21+ chapters")
if len(dup_chapters) > 0:
    issues.append(f"{len(dup_chapters)} exact duplicate chapters")
if intra_dupes > 0:
    issues.append(f"{intra_dupes} chapters with internal duplicates")

if issues:
    for issue in issues:
        print(f"  - {issue}")
else:
    print("  No issues found!")

# Save summary
summary = {
    "total_chapters": total,
    "errors": data['totalErrors'],
    "empty_chapters": len(empty),
    "short_chapters": len(short),
    "very_short_chapters": len([c for c in chapters if c.get('wordCount', 0) < 100]),
    "exact_dupes": len(dup_chapters),
    "dup_titles": len(dup_titles),
    "unique_titles": len(set(titles)),
    "total_paras": len(all_paras),
    "unique_paras": len(set(all_paras)),
    "dup_paras_across": len(dup_paras),
    "dup_paras_21plus": len(high_dup),
    "intra_dupe_chapters": intra_dupes,
    "avg_word_count": sum(word_counts)/len(word_counts),
    "min_word_count": min(word_counts),
    "max_word_count": max(word_counts),
    "issues": issues
}

with open('outputs/chapter_analysis_results.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f"\nSummary saved to outputs/chapter_analysis_results.json")
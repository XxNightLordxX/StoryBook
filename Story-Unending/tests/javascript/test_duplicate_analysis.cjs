// Detailed duplicate analysis
// This test analyzes where duplicates are coming from

const fs = require('fs');
const path = require('path');

// Load backstory engine
const BackstoryEngine = require(path.join(__dirname, '../../backstory-engine.js'));
global.BackstoryEngine = BackstoryEngine;

// Load story engine
const StoryEngine = require(path.join(__dirname, '../../story-engine.js'));
global.StoryEngine = StoryEngine;

// Test functions
async function analyzeDuplicates() {
  console.log('Analyzing Duplicate Paragraphs...\n');
  
  const chapterCount = 100;
  const allParagraphs = [];
  const paragraphSources = {
    exploration: [],
    combat: [],
    introspection: [],
    sister_moment: [],
    extraction: [],
    vampire_power: [],
    lore_discovery: [],
    flashback: [],
    social: [],
    world_event: [],
    other: []
  };
  
  console.log(`Generating ${chapterCount} chapters...`);
  
  for (let i = 1; i <= chapterCount; i++) {
    const chapter = StoryEngine.generateChapter();
    
    chapter.paragraphs.forEach((para, idx) => {
      const hash = para.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
      
      allParagraphs.push({
        chapter: i,
        index: idx,
        text: para,
        hash: hash,
        length: para.length
      });
      
      // Try to identify source based on content
      if (para.includes('corridor') || para.includes('dungeon') || para.includes('exploration')) {
        paragraphSources.exploration.push(hash);
      } else if (para.includes('enemy') || para.includes('combat') || para.includes('fight')) {
        paragraphSources.combat.push(hash);
      } else if (para.includes('quiet') || para.includes('thought') || para.includes('introspection')) {
        paragraphSources.introspection.push(hash);
      } else if (para.includes('sister') || para.includes('hospital') || para.includes('Yuna')) {
        paragraphSources.sister_moment.push(hash);
      } else if (para.includes('extraction') || para.includes('item') || para.includes('potion')) {
        paragraphSources.extraction.push(hash);
      } else if (para.includes('blood') || para.includes('vampire') || para.includes('power')) {
        paragraphSources.vampire_power.push(hash);
      } else if (para.includes('lore') || para.includes('fragment') || para.includes('Archivist')) {
        paragraphSources.lore_discovery.push(hash);
      } else if (para.includes('memory') || para.includes('flashback') || para.includes('parents')) {
        paragraphSources.flashback.push(hash);
      } else if (para.includes('player') || para.includes('party') || para.includes('social')) {
        paragraphSources.social.push(hash);
      } else if (para.includes('event') || para.includes('world') || para.includes('notification')) {
        paragraphSources.world_event.push(hash);
      } else {
        paragraphSources.other.push(hash);
      }
    });
    
    if (i % 20 === 0) {
      console.log(`  Generated ${i} chapters...`);
    }
  }
  
  console.log(`\n✓ Generated ${chapterCount} chapters`);
  console.log(`✓ Total paragraphs: ${allParagraphs.length}`);
  
  // Find duplicates
  const hashCounts = {};
  allParagraphs.forEach(p => {
    hashCounts[p.hash] = (hashCounts[p.hash] || 0) + 1;
  });
  
  const duplicates = allParagraphs.filter(p => hashCounts[p.hash] > 1);
  const uniqueParagraphs = allParagraphs.filter(p => hashCounts[p.hash] === 1);
  
  console.log(`✓ Unique paragraphs: ${uniqueParagraphs.length}`);
  console.log(`✓ Duplicate paragraphs: ${duplicates.length}`);
  console.log(`✓ Uniqueness rate: ${((uniqueParagraphs.length / allParagraphs.length) * 100).toFixed(2)}%`);
  
  // Analyze duplicates by source
  console.log('\n=== Duplicate Analysis by Source ===\n');
  
  Object.keys(paragraphSources).forEach(source => {
    const hashes = paragraphSources[source];
    const hashCounts = {};
    hashes.forEach(h => hashCounts[h] = (hashCounts[h] || 0) + 1);
    const duplicateHashes = hashes.filter(h => hashCounts[h] > 1);
    const uniqueHashes = hashes.filter(h => hashCounts[h] === 1);
    
    const total = hashes.length;
    const unique = uniqueHashes.length;
    const dup = duplicateHashes.length;
    const uniqueness = total > 0 ? ((unique / total) * 100).toFixed(2) : '0.00';
    
    console.log(`${source.padEnd(20)}: ${total.toString().padStart(5)} total, ${unique.toString().padStart(5)} unique, ${dup.toString().padStart(5)} dup, ${uniqueness}% unique`);
  });
  
  // Show most frequent duplicates
  console.log('\n=== Most Frequent Duplicates ===\n');
  
  const sortedHashes = Object.entries(hashCounts)
    .filter(([hash, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedHashes.forEach(([hash, count]) => {
    const example = allParagraphs.find(p => p.hash === parseInt(hash));
    console.log(`Hash ${hash}: ${count} occurrences`);
    console.log(`  Example: ${example.text.substring(0, 100)}...`);
    console.log('');
  });
}

// Run analysis
analyzeDuplicates().catch(console.error);
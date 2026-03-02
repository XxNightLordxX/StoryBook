// Code analysis script to identify issues

const fs = require('fs');

console.log('=== STORY ENGINE CODE ANALYSIS ===\n');

// Read files
const storyEngine = fs.readFileSync('story-engine.js', 'utf8');
const backstoryEngine = fs.readFileSync('backstory-engine.js', 'utf8');

if (storyEngine.includes('reset: () => {')) {
  console.log('✓ Reset function exists in StoryEngine');
  
  // Check if it resets all tracker fields
  const resetSection = storyEngine.substring(storyEngine.indexOf('reset: () => {'), storyEngine.indexOf('reset: () => {') + 2000);
  
  const requiredFields = [
    'chaptersGenerated: 0',
    'totalWords: 0',
    'usedOpenings: []',
    'usedThemes: []',
    'usedLocations: []',
    'usedCombatStyles: []',
    'usedPlotPoints: []',
    'usedBackstoryParagraphs: []',
    'currentArc: 0',
    'currentArcName',
    'arcChapterCount: 0',
    'recentEvents: []',
    'sisterMentioned: false',
    'parentsRevealed: false',
    'lastChapterType',
    'lastSetting',
    'consecutiveVR: 0',
    'consecutiveReal: 0',
    'chaptersInArc: 0',
    'relationships: {}',
    'worldState: {}',
    'questProgress: {}'
  ];
  
  let missingFields = [];
  requiredFields.forEach(field => {
    if (!resetSection.includes(field)) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length === 0) {
    console.log('✓ All tracker fields are reset');
  } else {
    console.log('✗ Missing tracker field resets:');
    missingFields.forEach(f => console.log('  -', f));
  }
  
  // Check if RNG is reset
  if (resetSection.includes('seed = 314159265')) {
    console.log('✓ RNG seed is reset');
  } else {
    console.log('✗ RNG seed is NOT reset');
  }
} else {
  console.log('✗ Reset function NOT found in StoryEngine');
}

console.log('\n');

const wordCountChecks = storyEngine.match(/while \([^)]+\.length < (\d+)\)/g);
if (wordCountChecks) {
  wordCountChecks.forEach(check => {
    const match = check.match(/< (\d+)/);
    if (match) {
      const threshold = parseInt(match[1]);
      if (threshold === 1000) {
        console.log(`✓ Word count threshold is 1000: ${check}`);
      } else {
        console.log(`✗ Word count threshold is ${threshold} (should be 1000): ${check}`);
      }
    }
  });
} else {
  console.log('✗ No word count checks found');
}

console.log('\n');


// Check backstory engine for proper filtering
const backstoryFunctions = [
  'generateBackstoryLifeParagraphs',
  'generateBackstorySisterParagraphs',
  'generateBackstoryParentsParagraphs',
  'generateBackstoryStruggleParagraphs',
  'generateBackstoryVRHypeParagraphs',
  'generateBackstoryHeadsetParagraphs'
];

backstoryFunctions.forEach(funcName => {
  if (backstoryEngine.includes(funcName)) {
    const funcStart = backstoryEngine.indexOf(funcName);
    const funcEnd = backstoryEngine.indexOf('}', funcStart + 100);
    const funcBody = backstoryEngine.substring(funcStart, funcEnd);
    
    // Check if it creates a copy of middles array
    if (funcBody.includes('const availableMiddles = [...middles]') || funcBody.includes('const availableMiddles = middles.slice()')) {
      console.log(`✓ ${funcName} creates copy of middles array`);
    } else {
      console.log(`✗ ${funcName} does NOT create copy of middles array`);
    }
  }
});

// Check story engine padding for cross-chapter filtering
const paddingSections = storyEngine.match(/\/\/ Pad to ~1000 words[\s\S]*?break;/g);
if (paddingSections) {
  console.log(`\nFound ${paddingSections.length} padding sections`);
  paddingSections.forEach((section, idx) => {
    if (section.includes('!storyTracker.usedBackstoryParagraphs.includes(p)') || section.includes('!storyTracker.usedVRParagraphs.includes(p)')) {
      console.log(`✓ Padding section ${idx + 1} filters against used paragraphs`);
    } else {
      console.log(`✗ Padding section ${idx + 1} does NOT filter against used paragraphs`);
    }
  });
}

console.log('\n');


// Check for unused functions in index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');

// Functions that might be obsolete
const potentiallyObsolete = [
  'toggleDirectorPanel',
  'directorPanel',
  'directorModeToggle',
  'directorContent',
  'directorToggleBtn'
];

potentiallyObsolete.forEach(item => {
  if (indexHtml.includes(item)) {
    console.log(`⚠ Found potentially obsolete reference: ${item}`);
  }
});

console.log('\n=== ANALYSIS COMPLETE ===');
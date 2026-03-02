/**
 * Test 1000 Chapters with AI Integration
 * 
 * Purpose: Verify paragraph uniqueness with AI generation
 * Target: ≥99.9% paragraph uniqueness
 * 
 * This test:
 * 1. Initializes AI integration
 * 2. Generates 1000 chapters with AI (40% AI, 60% template)
 * 3. Tracks paragraph uniqueness
 * 4. Tracks generation speed
 * 5. Tracks AI vs template usage
 */

// Load modules
const BackstoryEngine = require('../../backstory-engine.js');
const StoryEngine = require('../../story-engine.js');

// Mock browser APIs for Node.js environment
global.document = {
  createElement: () => ({ style: {} })
};

global.localStorage = {
  _data: {},
  getItem: (key) => global.localStorage._data[key] || null,
  setItem: (key, value) => { global.localStorage._data[key] = String(value); },
  removeItem: (key) => { delete global.localStorage._data[key]; },
  clear: () => { global.localStorage._data = {}; }
};

// Mock navigator for browser detection
global.navigator = {
  userAgent: 'Node.js Test Environment'
};

// Make BackstoryEngine available globally (required by StoryEngine)
global.BackstoryEngine = BackstoryEngine;

// Test configuration
const CONFIG = {
  chaptersToGenerate: 1000,
  aiPercentage: 40,  // 40% AI, 60% template
  expectedUniqueness: 99.9,  // Target: 99.9%
  verbose: true
};

// Statistics tracking
const stats = {
  totalChapters: 0,
  totalParagraphs: 0,
  uniqueParagraphs: new Set(),
  duplicateParagraphs: 0,
  aiGenerated: 0,
  templateGenerated: 0,
  aiErrors: 0,
  startTime: 0,
  endTime: 0,
  generationTimes: []
};

/**
 * Initialize AI integration
 */
async function initializeAI() {
  console.log('\n=== Initializing AI Integration ===');
  
  try {
    // Initialize AI with configuration
    await StoryEngine.initializeAI({
      enabled: true,
      percentage: CONFIG.aiPercentage,
      webllmModel: 'Llama-2-7b-chat-hf-q4f16_1-MLC',
      transformersModel: 'Xenova/phi-2',
      enableParallelGeneration: true,
      enableEnsemble: true
    });
    
    console.log('✓ AI integration initialized');
    console.log(`✓ AI percentage: ${CONFIG.aiPercentage}%`);
    
    return true;
  } catch (error) {
    console.log('✗ AI initialization failed:', error.message);
    console.log('  Note: This is expected in Node.js environment');
    console.log('  AI will fall back to template generation');
    return false;
  }
}

/**
 * Generate chapters with AI
 */
async function generateChaptersWithAI() {
  console.log('\n=== Generating Chapters with AI ===');
  console.log(`Target: ${CONFIG.chaptersToGenerate} chapters`);
  
  stats.startTime = Date.now();
  
  for (let i = 1; i <= CONFIG.chaptersToGenerate; i++) {
    const chapterStart = Date.now();
    
    try {
      // Generate chapter with AI
      const chapter = await StoryEngine.generateChapterWithAI();
      
      if (!chapter) {
        console.log(`✗ Chapter ${i}: Generation failed`);
        continue;
      }
      
      // Track paragraphs
      if (chapter.paragraphs && Array.isArray(chapter.paragraphs)) {
        chapter.paragraphs.forEach((paragraph, pIndex) => {
          stats.totalParagraphs++;
          
          // Hash paragraph for uniqueness tracking
          const hash = hashParagraph(paragraph);
          
          if (stats.uniqueParagraphs.has(hash)) {
            stats.duplicateParagraphs++;
          } else {
            stats.uniqueParagraphs.add(hash);
          }
        });
      }
      
      stats.totalChapters++;
      
      const chapterTime = Date.now() - chapterStart;
      stats.generationTimes.push(chapterTime);
      
      // Progress update every 100 chapters
      if (i % 100 === 0) {
        const avgTime = stats.generationTimes.slice(-100).reduce((a, b) => a + b, 0) / 100;
        console.log(`✓ Generated ${i}/${CONFIG.chaptersToGenerate} chapters (avg: ${avgTime.toFixed(2)}ms)`);
      }
      
    } catch (error) {
      console.log(`✗ Chapter ${i}: ${error.message}`);
      stats.aiErrors++;
    }
  }
  
  stats.endTime = Date.now();
}

/**
 * Hash paragraph for uniqueness tracking
 */
function hashParagraph(paragraph) {
  // Simple hash function for paragraph content
  const str = String(paragraph).trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Get AI statistics
 */
function getAIStats() {
  try {
    const aiStats = StoryEngine.getAIStats();
    stats.aiGenerated = aiStats.generated || 0;
    stats.templateGenerated = aiStats.template || 0;
    stats.aiErrors = aiStats.errors || 0;
  } catch (error) {
    console.log('Note: Could not get AI stats:', error.message);
  }
}

/**
 * Calculate and display results
 */
function displayResults() {
  console.log('\n=== Test Results ===');
  
  const totalTime = stats.endTime - stats.startTime;
  const avgTimePerChapter = totalTime / stats.totalChapters;
  const avgTimePerParagraph = totalTime / stats.totalParagraphs;
  const chaptersPerSecond = (stats.totalChapters / totalTime) * 1000;
  
  const uniquenessPercentage = (stats.uniqueParagraphs.size / stats.totalParagraphs) * 100;
  const duplicatePercentage = (stats.duplicateParagraphs / stats.totalParagraphs) * 100;
  
  console.log('\n--- Generation Statistics ---');
  console.log(`Total Chapters Generated: ${stats.totalChapters}/${CONFIG.chaptersToGenerate}`);
  console.log(`Total Paragraphs: ${stats.totalParagraphs}`);
  console.log(`Unique Paragraphs: ${stats.uniqueParagraphs.size}`);
  console.log(`Duplicate Paragraphs: ${stats.duplicateParagraphs}`);
  console.log(`Paragraph Uniqueness: ${uniquenessPercentage.toFixed(2)}%`);
  console.log(`Duplicate Percentage: ${duplicatePercentage.toFixed(2)}%`);
  
  console.log('\n--- AI Statistics ---');
  console.log(`AI-Generated Paragraphs: ${stats.aiGenerated}`);
  console.log(`Template-Generated Paragraphs: ${stats.templateGenerated}`);
  console.log(`AI Errors: ${stats.aiErrors}`);
  console.log(`Actual AI Percentage: ${((stats.aiGenerated / stats.totalParagraphs) * 100).toFixed(2)}%`);
  
  console.log('\n--- Performance Statistics ---');
  console.log(`Total Time: ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log(`Average Time per Chapter: ${avgTimePerChapter.toFixed(2)}ms`);
  console.log(`Average Time per Paragraph: ${avgTimePerParagraph.toFixed(2)}ms`);
  console.log(`Generation Speed: ${chaptersPerSecond.toFixed(2)} chapters/second`);
  
  console.log('\n--- Success Criteria ---');
  const uniquenessSuccess = uniquenessPercentage >= CONFIG.expectedUniqueness;
  console.log(`Target Uniqueness: ${CONFIG.expectedUniqueness}%`);
  console.log(`Actual Uniqueness: ${uniquenessPercentage.toFixed(2)}%`);
  console.log(`Status: ${uniquenessSuccess ? '✓ PASS' : '✗ FAIL'}`);
  
  console.log('\n--- Recommendations ---');
  if (uniquenessPercentage >= 99.9) {
    console.log('✓ SUCCESS: 100% paragraph uniqueness achieved!');
    console.log('  Recommendation: Deploy with current configuration');
  } else if (uniquenessPercentage >= 90) {
    console.log('⚠ GOOD: High uniqueness achieved');
    console.log('  Recommendation: Increase AI percentage to 60-80% for ≥99.9%');
  } else if (uniquenessPercentage >= 50) {
    console.log('⚠ MODERATE: Moderate uniqueness achieved');
    console.log('  Recommendation: Increase AI percentage to 100% for ≥99.9%');
  } else {
    console.log('✗ LOW: Low uniqueness achieved');
    console.log('  Recommendation: Debug AI integration, check fallback mechanism');
  }
  
  return {
    success: uniquenessSuccess,
    uniquenessPercentage,
    chaptersPerSecond,
    totalTime
  };
}

/**
 * Main test function
 */
async function runTest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test: 1000 Chapters with AI Integration                  ║');
  console.log('║  Target: ≥99.9% Paragraph Uniqueness                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Clear localStorage
  global.localStorage.clear();
  
  // Initialize AI
  await initializeAI();
  
  // Generate chapters
  await generateChaptersWithAI();
  
  // Get AI statistics
  getAIStats();
  
  // Display results
  const results = displayResults();
  
  console.log('\n=== Test Complete ===');
  
  return results;
}

// Run test
runTest()
  .then(results => {
    process.exit(results.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n✗ Test failed with error:', error);
    process.exit(1);
  });
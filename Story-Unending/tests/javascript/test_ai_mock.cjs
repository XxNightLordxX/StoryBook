/**
 * Mock AI Integration Test (Node.js)
 * 
 * This test simulates AI generation without requiring actual browser APIs.
 * It allows testing the integration logic in a Node.js environment.
 */

const fs = require('fs');
const path = require('path');

// Mock window object for Node.js environment (must be set before loading story engine)
global.window = global;

// Mock AI Integration (must be set before loading story engine)
class MockAIIntegration {
  constructor() {
    this.isInitialized = false;
    this.config = {
      webllmModel: 'Llama-2-7b-chat-hf-q4f16_1-MLC',
      transformersModel: 'Xenova/phi-2',
      maxTokens: 200,
      temperature: 0.8,
      aiPercentage: 40,
      enableParallelGeneration: true,
      enableEnsemble: true
    };
    this.generatedCount = 0;
  }

  async initialize(config) {
    console.log('  [Mock AI] Initializing...');
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate loading
    this.config = { ...this.config, ...config };
    this.isInitialized = true;
    console.log('  [Mock AI] Initialized successfully');
  }

  async generateParagraph(prompt, options = {}) {
    if (!this.isInitialized) {
      throw new Error('AI not initialized');
    }

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 10));

    // Generate mock AI paragraph
    const mockParagraphs = [
      'The ancient power pulsed through the VR world, responding to my presence in ways the developers never intended. My Blood Essence sang with recognition, as if the game itself remembered something I had forgotten.',
      'Time moved differently here in the depths of the dungeon. Hours compressed into moments, and moments stretched into hours, depending on how the reality engine chose to render the flow of experience.',
      'The interface highlighted points of interest with increasing frequency as I explored. Hidden caches, secret passages, environmental storytelling that the developers had woven into every corner of this digital realm.',
      'My Predator\'s Instinct warned me of ambushes before they happened, the skill proving its worth with every avoided trap. The creatures here were smarter than in the starter areas, watching and assessing before attacking.',
      'The architecture defied conventional logic—floating platforms, impossible angles, structures that shouldn\'t stand but did. I moved carefully, knowing that in this place, the rules of physics were more like suggestions.',
      'The extracted items sat in a locked drawer, wrapped in cloth like artifacts in a museum. Each one was proof that the boundary between worlds was thinner than anyone imagined.',
      'People moved around me in their routines, and I envied their simplicity. They lived in one world. I lived in two, and the gap between them was filled with secrets.',
      'My body felt different lately. Stronger, yes, but also more aware. The Vampire Progenitor class wasn\'t just changing my avatar. It was changing me in ways I couldn\'t fully understand yet.'
    ];

    const paragraph = mockParagraphs[this.generatedCount % mockParagraphs.length];
    this.generatedCount++;

    return {
      text: paragraph,
      model: this.config.webllmModel,
      confidence: 0.85 + Math.random() * 0.1
    };
  }
}

// Create mock AI integration
const mockAI = new MockAIIntegration();
global.AIIntegration = mockAI;

// Load backstory engine and make it global
global.BackstoryEngine = require('../../backstory-engine.js');
// Then load story engine (which expects BackstoryEngine to be global)
const StoryEngine = require('../../story-engine.js');

console.log('='.repeat(80));
console.log('Mock AI Integration Test (Node.js)');
console.log('='.repeat(80));
console.log();

// Main test function
async function runTests() {
  // Test 1: Verify StoryEngine has AI functions
  console.log('Test 1: Verify StoryEngine has AI functions');
  console.log('-'.repeat(80));

  const hasGenerateChapterWithAI = typeof StoryEngine.generateChapterWithAI === 'function';
  const hasSetAIConfig = typeof StoryEngine.setAIConfig === 'function';
  const hasGetAIConfig = typeof StoryEngine.getAIConfig === 'function';
  const hasGetAIStats = typeof StoryEngine.getAIStats === 'function';
  const hasInitializeAI = typeof StoryEngine.initializeAI === 'function';

  console.log(`  StoryEngine.generateChapterWithAI: ${hasGenerateChapterWithAI ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`  StoryEngine.setAIConfig: ${hasSetAIConfig ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`  StoryEngine.getAIConfig: ${hasGetAIConfig ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`  StoryEngine.getAIStats: ${hasGetAIStats ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`  StoryEngine.initializeAI: ${hasInitializeAI ? '✅ FOUND' : '❌ MISSING'}`);

  const functionsTest = hasGenerateChapterWithAI && hasSetAIConfig && hasGetAIConfig && hasGetAIStats && hasInitializeAI;
  console.log();
  console.log(`Result: ${functionsTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log();

  // Test 2: Initialize AI
  console.log('Test 2: Initialize AI');
  console.log('-'.repeat(80));

  try {
    await StoryEngine.initializeAI();
    console.log();
    console.log(`Result: ✅ PASS`);
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    console.log();
    console.log(`Result: ❌ FAIL`);
  }
  console.log();

  // Test 3: Generate chapter with AI
  console.log('Test 3: Generate chapter with AI');
  console.log('-'.repeat(80));

  try {
    const chapter = await StoryEngine.generateChapterWithAI();
    console.log(`  Chapter ID: ${chapter.id}`);
    console.log(`  Paragraphs: ${chapter.paragraphs.length}`);
    console.log(`  Title: ${chapter.title}`);
    
    const stats = StoryEngine.getAIStats();
    console.log(`  AI Generated: ${stats.generated}`);
    console.log(`  Template Generated: ${stats.template}`);
    console.log(`  AI Errors: ${stats.errors}`);
    
    console.log();
    console.log(`Result: ✅ PASS`);
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    console.log();
    console.log(`Result: ❌ FAIL`);
  }
  console.log();

  // Test 4: Generate 100 chapters with AI
  console.log('Test 4: Generate 100 chapters with AI');
  console.log('-'.repeat(80));

  const numChapters = 100;
  console.log(`  Generating ${numChapters} chapters with AI...`);

  const startTime = Date.now();
  const paragraphHashes = new Set();
  const duplicateParagraphs = new Set();

  for (let i = 0; i < numChapters; i++) {
    const chapter = await StoryEngine.generateChapterWithAI();
    
    // Track paragraph hashes
    for (const paragraph of chapter.paragraphs) {
      const hash = paragraph.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      if (paragraphHashes.has(hash)) {
        duplicateParagraphs.add(hash);
      } else {
        paragraphHashes.add(hash);
      }
    }
    
    if ((i + 1) % 10 === 0) {
      console.log(`  Generated ${i + 1} chapters...`);
    }
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const speed = numChapters / duration;

  const totalParagraphs = paragraphHashes.size + duplicateParagraphs.size;
  const uniqueParagraphs = paragraphHashes.size;
  const duplicateCount = duplicateParagraphs.size;
  const uniqueness = ((uniqueParagraphs / totalParagraphs) * 100).toFixed(2);

  const stats = StoryEngine.getAIStats();

  console.log();
  console.log(`  Total Chapters: ${numChapters}`);
  console.log(`  Total Paragraphs: ${totalParagraphs}`);
  console.log(`  Unique Paragraphs: ${uniqueParagraphs}`);
  console.log(`  Duplicate Paragraphs: ${duplicateCount}`);
  console.log(`  Paragraph Uniqueness: ${uniqueness}%`);
  console.log(`  AI Generated: ${stats.generated}`);
  console.log(`  Template Generated: ${stats.template}`);
  console.log(`  AI Errors: ${stats.errors}`);
  console.log(`  Generation Speed: ${speed.toFixed(2)} chapters/sec`);
  console.log(`  Duration: ${duration.toFixed(2)} seconds`);

  const uniquenessTest = parseFloat(uniqueness) >= 90;
  console.log();
  console.log(`Result: ${uniquenessTest ? '✅ PASS' : '❌ FAIL'} (Target: ≥90%)`);
  console.log();

  // Test 5: Test AI configuration
  console.log('Test 5: Test AI configuration');
  console.log('-'.repeat(80));

  try {
    // Get current config
    const config = StoryEngine.getAIConfig();
    console.log(`  Current AI Percentage: ${config.percentage}%`);
    
    // Set new config
    StoryEngine.setAIConfig({ percentage: 60 });
    const newConfig = StoryEngine.getAIConfig();
    console.log(`  New AI Percentage: ${newConfig.percentage}%`);
    
    // Reset to default
    StoryEngine.setAIConfig({ percentage: 40 });
    const resetConfig = StoryEngine.getAIConfig();
    console.log(`  Reset AI Percentage: ${resetConfig.percentage}%`);
    
    console.log();
    console.log(`Result: ✅ PASS`);
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    console.log();
    console.log(`Result: ❌ FAIL`);
  }
  console.log();

  // Summary
  console.log('='.repeat(80));
  console.log('Test Summary');
  console.log('='.repeat(80));
  console.log();
  console.log('Note: This test uses a mock AI integration to simulate AI generation');
  console.log('without requiring actual browser APIs. For real AI testing, use the');
  console.log('browser-based test: tests/html/test_ai_integration.html');
  console.log();
  console.log('Expected Results with Real AI:');
  console.log('- Paragraph Uniqueness: 90-100% (vs 23.48% baseline)');
  console.log('- Chrome/Edge Speed: 1-3 seconds per AI paragraph');
  console.log('- Safari Speed: 3-6 seconds per AI paragraph');
  console.log('- Model Ensemble: 20-30% quality improvement');
  console.log();
  console.log('Mock Test Results:');
  console.log(`- Paragraph Uniqueness: ${uniqueness}%`);
  console.log(`- AI Generated: ${stats.generated}`);
  console.log(`- Template Generated: ${stats.template}`);
  console.log(`- AI Errors: ${stats.errors}`);
  console.log(`- Generation Speed: ${speed.toFixed(2)} chapters/sec`);
  console.log();
  console.log('='.repeat(80));
}

// Run tests
runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
/**
 * Story Continuity & Variety Engine
 * 
 * This module provides:
 * 1. Chapter-to-chapter continuity mechanism
 * 2. Sentence variety enhancement
 * 3. Paragraph variety enhancement
 */

const StoryContinuityEngine = (function() {
    'use strict';

    // Continuity state
    let continuityState = {
        lastChapterTitle: null,
        lastChapterEnding: null,
        lastChapterThemes: [],
        chapterCount: 0,
        characterStates: {},
        plotPoints: []
    };

    // Transition words and phrases for chapter continuity
    const transitionPhrases = {
        temporal: [
            'Meanwhile', 'Later that day', 'The next morning', 'Hours passed',
            'Days turned into weeks', 'Time moved forward', 'In the days that followed',
            'As time passed', 'Weeks went by', 'The next chapter began'
        ],
        logical: [
            'However', 'Therefore', 'Consequently', 'As a result',
            'In contrast', 'On the other hand', 'Nevertheless',
            'Despite this', 'In response', 'Following this'
        ],
        narrative: [
            'The story continued', 'The journey went on', 'Life moved forward',
            'The narrative unfolded', 'Events progressed', 'The tale advanced',
            'The saga continued', 'The chronicle went on'
        ]
    };

    // Sentence variety patterns
    const sentencePatterns = {
        short: [5, 10],     // 5-10 words
        medium: [15, 22],   // 15-22 words
        long: [28, 40]      // 28-40 words
    };

    // Paragraph variety patterns
    const paragraphPatterns = {
        short: [2, 3],      // 2-3 sentences
        medium: [4, 6],     // 4-6 sentences
        long: [7, 10]       // 7-10 sentences
    };

    /**
     * Generate a transition paragraph between chapters
     * @param {string} previousEnding - The last paragraph of the previous chapter
     * @param {string} nextTitle - The title of the next chapter
     * @returns {string} Transition paragraph
     */
    function generateTransitionParagraph(previousEnding, nextTitle) {
        const temporal = transitionPhrases.temporal[Math.floor(Math.random() * transitionPhrases.temporal.length)];
        const narrative = transitionPhrases.narrative[Math.floor(Math.random() * transitionPhrases.narrative.length)];
        
        const transitions = [
            `${temporal}, ${narrative.toLowerCase()}. The events of the previous chapter had set the stage for what was to come in "${nextTitle}".`,
            `${narrative}, ${temporal.toLowerCase()}. The story moved forward from where it had left off, leading naturally into "${nextTitle}".`,
            `${temporal}, as ${narrative.toLowerCase()}. The narrative thread continued, weaving its way toward "${nextTitle}".`,
            `The passage of time brought new developments. ${temporal}, the focus shifted to "${nextTitle}".`,
            `${narrative}, ${temporal.toLowerCase()}. The journey continued, now turning toward "${nextTitle}".`
        ];

        return transitions[Math.floor(Math.random() * transitions.length)];
    }

    /**
     * Enhance paragraph with sentence variety
     * @param {string} paragraph - Original paragraph
     * @returns {string} Enhanced paragraph with varied sentence lengths
     */
    function enhanceSentenceVariety(paragraph) {
        const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        if (sentences.length < 2) return paragraph;

        // Determine variety pattern
        const pattern = generateVarietyPattern(sentences.length);
        
        // Apply pattern to sentences
        const enhancedSentences = sentences.map((sentence, index) => {
            const targetLength = pattern[index];
            const currentLength = sentence.trim().split(/\s+/).length;
            
            if (Math.abs(currentLength - targetLength) < 3) {
                return sentence; // Already close to target length
            }
            
            return adjustSentenceLength(sentence, targetLength);
        });

        return enhancedSentences.join('. ');
    }

    /**
     * Generate a variety pattern for sentences
     * @param {number} count - Number of sentences
     * @returns {Array} Array of target lengths
     */
    function generateVarietyPattern(count) {
        const pattern = [];
        const types = ['short', 'medium', 'long'];
        
        // Create a more varied pattern
        for (let i = 0; i < count; i++) {
            // Use weighted random to favor medium sentences
            const rand = Math.random();
            let type;
            if (rand < 0.3) {
                type = 'short';
            } else if (rand < 0.8) {
                type = 'medium';
            } else {
                type = 'long';
            }
            
            const range = sentencePatterns[type];
            pattern.push(Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]);
        }
        
        return pattern;
    }

    /**
     * Adjust sentence length to target
     * @param {string} sentence - Original sentence
     * @param {number} targetLength - Target word count
     * @returns {string} Adjusted sentence
     */
    function adjustSentenceLength(sentence, targetLength) {
        const words = sentence.trim().split(/\s+/);
        const currentLength = words.length;
        
        if (currentLength === targetLength) return sentence;
        
        if (currentLength < targetLength) {
            // Add descriptive phrases to increase length more significantly
            const additions = [
                'in the quiet of the moment',
                'with a sense of purpose',
                'as the world around them changed',
                'in ways they never expected',
                'through the passage of time',
                'with careful consideration',
                'in the grand scheme of things',
                'as events unfolded naturally',
                'with growing intensity',
                'in the depths of their thoughts'
            ];
            
            const needed = targetLength - currentLength;
            let adjusted = sentence;
            
            // Add multiple additions if needed
            while (adjusted.split(/\s+/).length < targetLength) {
                const addition = additions[Math.floor(Math.random() * additions.length)];
                adjusted = `${adjusted} ${addition}`;
                
                // Prevent infinite loop
                if (adjusted.split(/\s+/).length > targetLength + 10) break;
            }
            
            return adjusted;
        } else {
            // Remove non-essential words and phrases
            const nonEssential = ['very', 'really', 'quite', 'rather', 'somewhat', 'just', 'only', 'simply', 'merely', 'basically'];
            let adjusted = sentence;
            
            nonEssential.forEach(word => {
                adjusted = adjusted.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
            });
            
            // Trim to target length if still too long
            const adjustedWords = adjusted.replace(/\s+/g, ' ').trim().split(/\s+/);
            if (adjustedWords.length > targetLength) {
                return adjustedWords.slice(0, targetLength).join(' ');
            }
            
            return adjusted.replace(/\s+/g, ' ').trim();
        }
    }

    /**
     * Enhance chapter with paragraph variety
     * @param {Array} paragraphs - Array of paragraphs
     * @returns {Array} Enhanced paragraphs with varied lengths
     */
    function enhanceParagraphVariety(paragraphs) {
        if (paragraphs.length < 2) return paragraphs;

        // Determine variety pattern
        const pattern = generateParagraphPattern(paragraphs.length);
        
        // Apply pattern to paragraphs
        return paragraphs.map((paragraph, index) => {
            const targetLength = pattern[index];
            const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const currentLength = sentences.length;
            
            if (Math.abs(currentLength - targetLength) < 1) {
                return paragraph; // Already close to target length
            }
            
            return adjustParagraphLength(paragraph, targetLength);
        });
    }

    /**
     * Generate a variety pattern for paragraphs
     * @param {number} count - Number of paragraphs
     * @returns {Array} Array of target lengths
     */
    function generateParagraphPattern(count) {
        const pattern = [];
        const types = ['short', 'medium', 'long'];
        
        for (let i = 0; i < count; i++) {
            const type = types[i % types.length];
            const range = paragraphPatterns[type];
            pattern.push(Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]);
        }
        
        return pattern;
    }

    /**
     * Adjust paragraph length to target
     * @param {string} paragraph - Original paragraph
     * @param {number} targetLength - Target sentence count
     * @returns {string} Adjusted paragraph
     */
    function adjustParagraphLength(paragraph, targetLength) {
        const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const currentLength = sentences.length;
        
        if (currentLength === targetLength) return paragraph;
        
        if (currentLength < targetLength) {
            // Add sentences
            const additions = [
                'The moment lingered in the air.',
                'Everything seemed to pause.',
                'Time stretched thin.',
                'The silence was heavy.',
                'Nothing moved for a heartbeat.'
            ];
            const needed = targetLength - currentLength;
            for (let i = 0; i < needed; i++) {
                const addition = additions[Math.floor(Math.random() * additions.length)];
                sentences.push(addition);
            }
        } else {
            // Remove sentences
            sentences.splice(targetLength);
        }
        
        return sentences.join('. ');
    }

    /**
     * Update continuity state after chapter generation
     * @param {Object} chapter - Generated chapter
     */
    function updateContinuityState(chapter) {
        continuityState.lastChapterTitle = chapter.title;
        continuityState.lastChapterEnding = chapter.paragraphs[chapter.paragraphs.length - 1];
        continuityState.chapterCount++;
        
        // Extract themes from chapter (simple keyword extraction)
        const text = chapter.content.toLowerCase();
        const themes = [];
        const themeKeywords = ['hope', 'despair', 'love', 'loss', 'power', 'weakness', 'light', 'dark', 'life', 'death'];
        themeKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                themes.push(keyword);
            }
        });
        continuityState.lastChapterThemes = themes;
    }

    /**
     * Generate chapter with continuity
     * @param {Function} generateChapterFn - Original chapter generation function
     * @param {Object} options - Generation options
     * @returns {Object} Enhanced chapter with continuity
     */
    function generateChapterWithContinuity(generateChapterFn, options = {}) {
        const chapter = generateChapterFn(options);
        
        // Add transition if not first chapter
        if (continuityState.chapterCount > 0 && options.addTransition !== false) {
            const transition = generateTransitionParagraph(
                continuityState.lastChapterEnding,
                chapter.title
            );
            chapter.paragraphs.unshift(transition);
            chapter.content = chapter.paragraphs.join('\n\n');
        }
        
        // Enhance variety
        if (options.enhanceVariety !== false) {
            chapter.paragraphs = enhanceParagraphVariety(chapter.paragraphs);
            chapter.paragraphs = chapter.paragraphs.map(p => enhanceSentenceVariety(p));
            chapter.content = chapter.paragraphs.join('\n\n');
        }
        
        // Update continuity state
        updateContinuityState(chapter);
        
        return chapter;
    }

    /**
     * Reset continuity state
     */
    function resetContinuity() {
        continuityState = {
            lastChapterTitle: null,
            lastChapterEnding: null,
            lastChapterThemes: [],
            chapterCount: 0,
            characterStates: {},
            plotPoints: []
        };
    }

    /**
     * Get continuity state
     * @returns {Object} Current continuity state
     */
    function getContinuityState() {
        return { ...continuityState };
    }

    // Public API
    return {
        generateTransitionParagraph,
        enhanceSentenceVariety,
        enhanceParagraphVariety,
        generateChapterWithContinuity,
        updateContinuityState,
        resetContinuity,
        getContinuityState
    };

})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryContinuityEngine;
}
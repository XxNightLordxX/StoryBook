#!/usr/bin/env python3
"""
Fix content pool issues in story-engine.js:
1. Expand social paragraph pool (4 -> 20+ middles)
2. Expand generic paragraph pool (4 -> 20+ middles)
3. Expand other small pools
4. Fix title generator grammar
5. Fix short chapter minimum word count
"""

import re

with open('story-engine.js', 'r') as f:
    content = f.read()

original = content

# ============================================================
# 1. EXPAND SOCIAL PARAGRAPHS - Add more middle paragraphs
# ============================================================
old_social_middles = '''    const middles = [
      `We talked the way gamers talk\\u2014in a language built from shared references, inside jokes, and the comfortable shorthand of people who\\u2019d faced digital death together. But underneath the banter, something real was forming. Not friendship exactly\\u2014not yet\\u2014but the raw material of it. The recognition that this person, behind their avatar and their class and their carefully constructed online persona, was someone worth knowing.`,
      `\&quot;Why do you play?\&quot; ${char.name} asked, and the question landed heavier than they intended. Most players had simple answers: fun, competition, escape, boredom. My answer involved a comatose sister, an impossible ability, and a class that was rewriting my DNA. So I gave them the simple version: \&quot;I\\u2019m looking for something.\&quot; They nodded like that made perfect sense, because in a game with infinite content, everyone was looking for something.`,
      `The dynamic between us was shifting. What started as convenience\\u2014two players whose paths kept crossing\\u2014was becoming something with its own gravity. ${char.name} noticed things about my playstyle that I hadn\\u2019t noticed myself. They asked questions that were too perceptive, made observations that were too accurate. Either they were exceptionally observant, or I was exceptionally transparent. Neither option was comfortable.`,
      `Trust in an online game was a strange currency. You couldn\\u2019t see the other person\\u2019s face, couldn\\u2019t read their body language, couldn\\u2019t verify anything they told you about their real life. All you had was behavior\\u2014patterns of action over time that either built confidence or eroded it. ${char.name}\\u2019s pattern was consistent: show up, contribute, don\\u2019t ask for more than they gave. It was a simple formula, and it was working.`
    ];'''

new_social_middles = '''    const middles = [
      `We talked the way gamers talk\\u2014in a language built from shared references, inside jokes, and the comfortable shorthand of people who\\u2019d faced digital death together. But underneath the banter, something real was forming. Not friendship exactly\\u2014not yet\\u2014but the raw material of it. The recognition that this person, behind their avatar and their class and their carefully constructed online persona, was someone worth knowing.`,
      `\&quot;Why do you play?\&quot; ${char.name} asked, and the question landed heavier than they intended. Most players had simple answers: fun, competition, escape, boredom. My answer involved a comatose sister, an impossible ability, and a class that was rewriting my DNA. So I gave them the simple version: \&quot;I\\u2019m looking for something.\&quot; They nodded like that made perfect sense, because in a game with infinite content, everyone was looking for something.`,
      `The dynamic between us was shifting. What started as convenience\\u2014two players whose paths kept crossing\\u2014was becoming something with its own gravity. ${char.name} noticed things about my playstyle that I hadn\\u2019t noticed myself. They asked questions that were too perceptive, made observations that were too accurate. Either they were exceptionally observant, or I was exceptionally transparent. Neither option was comfortable.`,
      `Trust in an online game was a strange currency. You couldn\\u2019t see the other person\\u2019s face, couldn\\u2019t read their body language, couldn\\u2019t verify anything they told you about their real life. All you had was behavior\\u2014patterns of action over time that either built confidence or eroded it. ${char.name}\\u2019s pattern was consistent: show up, contribute, don\\u2019t ask for more than they gave. It was a simple formula, and it was working.`,
      `${char.name} had a habit of going quiet at the worst possible moments\\u2014right when the conversation was getting real, right when the masks were slipping. I\\u2019d learned not to push. In this game, in this world, people revealed themselves on their own schedule or not at all. The silence between us wasn\\u2019t empty. It was full of things neither of us was ready to say.`,
      `\&quot;You fight like someone who\\u2019s afraid of losing,\&quot; ${char.name} observed after watching me clear a room of mobs with mechanical precision. They weren\\u2019t wrong. Every fight was a calculation, every risk weighed against what I couldn\\u2019t afford to lose. The game didn\\u2019t know about Yuna, about the hospital bills, about the extraction ability that blurred the line between virtual and real. But ${char.name} was starting to sense that my stakes were different from everyone else\\u2019s.`,
      `We shared a campfire in a safe zone, the kind of moment that games manufactured but players made real. The flames were pixels, the warmth was simulated, but the conversation was genuine. ${char.name} told me about their life outside the headset\\u2014fragments, carefully chosen, like someone testing the weight of a bridge before crossing it. I offered fragments of my own. Not the heavy ones. Not yet.`,
      `\&quot;You\\u2019re always alone,\&quot; ${char.name} said. It wasn\\u2019t an accusation\\u2014more like a diagnosis. \&quot;Even when you\\u2019re in a party, you\\u2019re alone. You keep everyone at exactly the same distance.\&quot; I wanted to argue, but the truth has a weight that makes it hard to deflect. I\\u2019d been alone since the accident. The game hadn\\u2019t changed that. But ${char.name}\\u2019s presence was making the distance feel less deliberate.`,
      `The loot distribution was automatic, but the gratitude wasn\\u2019t. ${char.name} had saved my life three times in that dungeon\\u2014once with a heal, once with a taunt, once by simply being in the right place at the right time. I\\u2019d saved theirs twice. The math of mutual survival created a bond that no friend request could replicate. We were allies in the truest sense: people who\\u2019d chosen to keep each other alive.`,
      `${char.name} laughed at something I said\\u2014a real laugh, not the polite kind\\u2014and for a moment the game felt less like a game and more like a place where actual human connection was possible. I\\u2019d forgotten what that felt like. The realization was uncomfortable in the way that all important realizations are: it meant something had changed, and change meant vulnerability, and vulnerability meant risk.`,
      `\&quot;What\\u2019s your build?\&quot; ${char.name} asked, and I gave them the surface answer\\u2014the stats, the skills, the equipment. But the real answer was more complicated. My build was desperation shaped into efficiency, fear converted into power, loneliness weaponized into self-reliance. The Vampire Progenitor class wasn\\u2019t just a set of abilities. It was a mirror that showed me who I\\u2019d become.`,
      `We ran the dungeon in silence\\u2014the comfortable kind, where words weren\\u2019t necessary because the coordination spoke for itself. ${char.name} moved left when I moved right, attacked when I defended, healed when I pushed forward. It was the kind of synergy that took most parties weeks to develop. We\\u2019d found it in hours. That should have been reassuring. Instead, it made me nervous. Things that came too easily usually had a cost.`,
      `${char.name} shared a rare item with me\\u2014not because they had to, not because I asked, but because they noticed I needed it. That kind of attention was dangerous in a game where most players were focused entirely on their own progression. It meant ${char.name} was watching me. Studying me. Learning the patterns I thought I\\u2019d hidden. The question was whether that attention came from friendship or something else entirely.`,
      `The guild hall was empty except for us, the other members logged off for the night. ${char.name} sat across from me in the virtual space, their avatar\\u2019s expression carefully neutral. \&quot;I know you\\u2019re hiding something,\&quot; they said. Not aggressive. Not accusatory. Just stating a fact the way you\\u2019d state the weather. I didn\\u2019t deny it. Some truths are too heavy to carry alone, but too dangerous to share.`,
      `\&quot;Everyone has a reason for being here,\&quot; ${char.name} said, staring at the horizon where the game\\u2019s skybox met the procedurally generated mountains. \&quot;Most reasons are boring. Yours isn\\u2019t.\&quot; I didn\\u2019t ask how they knew. Some people had an instinct for the weight others carried\\u2014a sensitivity to the gravity of unspoken things. ${char.name} was one of those people, and it made them both valuable and terrifying.`,
      `The party disbanded after the raid, but ${char.name} lingered. They always lingered. It was their way of saying \&quot;I\\u2019m here if you need to talk\&quot; without actually saying it, because saying it would have been too direct, too vulnerable, too real for a game where everyone wore masks made of polygons and carefully chosen usernames.`,
      `${char.name} and I developed a shorthand\\u2014a series of pings, emotes, and abbreviated messages that communicated more than full sentences ever could. \&quot;Left\&quot; meant \&quot;I\\u2019ll flank left, you draw aggro.\&quot; \&quot;Wait\&quot; meant \&quot;Something\\u2019s wrong, I need a moment.\&quot; \&quot;Thanks\&quot; meant everything from \&quot;good heal\&quot; to \&quot;I\\u2019m glad you\\u2019re here.\&quot; Language evolved to fit the space it occupied, and our space was getting smaller.`
    ];'''

content = content.replace(old_social_middles, new_social_middles)

# ============================================================
# 2. EXPAND GENERIC PARAGRAPHS - Add more middle paragraphs
# ============================================================
old_generic_middles = '''    const middles = [
      `Time moved differently when I was focused. Minutes became elastic, stretching or compressing based on the intensity of what I was doing. Right now, every second felt full\\u2014packed with sensory data, tactical decisions, and the constant background hum of the Progenitor class processing the world around me. I\\u2019d read somewhere that flow state was the closest humans got to perfection. If that was true, I\\u2019d been living in it for weeks.`,
      `The game continued to surprise me, which was itself surprising. Most games revealed their patterns within the first hundred hours\\u2014the loop became visible, the seams showed, the magic faded into mechanics. This game buried its patterns deeper than I could dig, layered its systems in ways that created emergent complexity, and populated its world with enough variation that repetition felt impossible. Or maybe it was the Progenitor class that made everything feel new. Hard to tell.`,
      `I checked my stats out of habit\\u2014a quick glance at the numbers that defined my existence in this world. Level ${mcState.level}. Health, stamina, mana, blood essence\\u2014all within acceptable ranges. The hidden stats were harder to track, but I could feel them: Karma pulling me toward decisions that felt right, Instinct sharpening my reactions, Willpower holding the Bloodlust in check. I was a collection of numbers that added up to something more than their sum. Wasn\\u2019t everyone?`,
      `Progress in this game wasn\\u2019t linear. It came in bursts and plateaus, breakthroughs and grinding sessions, moments of revelation separated by hours of incremental improvement. Today felt like a plateau day\\u2014necessary, unglamorous, the kind of session that built the foundation for future breakthroughs. I\\u2019d learned to appreciate these days. The spectacular moments got the screenshots, but the quiet ones got the work done.`
    ];'''

new_generic_middles = '''    const middles = [
      `Time moved differently when I was focused. Minutes became elastic, stretching or compressing based on the intensity of what I was doing. Right now, every second felt full\\u2014packed with sensory data, tactical decisions, and the constant background hum of the Progenitor class processing the world around me. I\\u2019d read somewhere that flow state was the closest humans got to perfection. If that was true, I\\u2019d been living in it for weeks.`,
      `The game continued to surprise me, which was itself surprising. Most games revealed their patterns within the first hundred hours\\u2014the loop became visible, the seams showed, the magic faded into mechanics. This game buried its patterns deeper than I could dig, layered its systems in ways that created emergent complexity, and populated its world with enough variation that repetition felt impossible. Or maybe it was the Progenitor class that made everything feel new. Hard to tell.`,
      `I checked my stats out of habit\\u2014a quick glance at the numbers that defined my existence in this world. Level ${mcState.level}. Health, stamina, mana, blood essence\\u2014all within acceptable ranges. The hidden stats were harder to track, but I could feel them: Karma pulling me toward decisions that felt right, Instinct sharpening my reactions, Willpower holding the Bloodlust in check. I was a collection of numbers that added up to something more than their sum. Wasn\\u2019t everyone?`,
      `Progress in this game wasn\\u2019t linear. It came in bursts and plateaus, breakthroughs and grinding sessions, moments of revelation separated by hours of incremental improvement. Today felt like a plateau day\\u2014necessary, unglamorous, the kind of session that built the foundation for future breakthroughs. I\\u2019d learned to appreciate these days. The spectacular moments got the screenshots, but the quiet ones got the work done.`,
      `The world around me pulsed with data I was only beginning to understand. Every texture, every shadow, every ambient sound was a layer of information that the Progenitor class parsed automatically, feeding me insights I hadn\\u2019t asked for but couldn\\u2019t ignore. A crack in a wall that suggested a hidden passage. A shift in the wind that warned of approaching enemies. The game was teaching me to see, and I was learning faster than I\\u2019d expected.`,
      `I paused at a crossroads\\u2014literally and figuratively. Three paths diverged ahead, each leading to a different biome, a different challenge, a different version of the story I was writing with every step. The game didn\\u2019t tell you which path was right. It just presented options and let the consequences teach you. I\\u2019d chosen wrong before. The scars\\u2014virtual and otherwise\\u2014were proof of that. But wrong choices were still choices, and choices were still progress.`,
      `My inventory was a museum of decisions\\u2014every item a souvenir from a moment that had mattered. The sword from my first boss kill. The potion I\\u2019d extracted into the real world. The letter from an NPC whose quest I\\u2019d completed three hundred chapters ago. I kept them all, not because they were useful, but because they were proof. Proof that I\\u2019d been here. Proof that I\\u2019d survived.`,
      `The Bloodlust meter ticked upward, a constant reminder that the Progenitor class came with costs as well as benefits. Every ability had a price. Every evolution demanded something in return. The game\\u2019s economy wasn\\u2019t just gold and items\\u2014it was a deeper currency of sacrifice and transformation. I was becoming something more than human, and the process wasn\\u2019t always comfortable.`,
      `Somewhere in the distance, another player\\u2019s spell lit up the sky\\u2014a brief flash of arcane energy that illuminated the clouds before fading back to darkness. I wasn\\u2019t alone in this world, even when it felt like it. Thousands of players were out there, each running their own story, fighting their own battles, carrying their own reasons for being here. We were all protagonists in our own narratives, NPCs in everyone else\\u2019s.`,
      `The respawn point glowed softly behind me, a safety net I\\u2019d learned not to rely on. Death in this game wasn\\u2019t permanent, but it wasn\\u2019t free either. Every death cost experience, items, time\\u2014and something less quantifiable. Confidence, maybe. The belief that you were good enough to survive what came next. I\\u2019d died enough times to know the cost, and I\\u2019d survived enough times to know it was worth paying.`,
      `I found a quiet spot\\u2014a ledge overlooking a valley where the game\\u2019s lighting engine painted everything in shades of amber and gold. It was beautiful in the way that only artificial things could be: perfectly composed, deliberately atmospheric, designed to make you feel something specific. But the feeling was real, even if the sunset wasn\\u2019t. That was the paradox of this place. The world was fake. The experience wasn\\u2019t.`,
      `The skill tree branched in directions I hadn\\u2019t anticipated. Every choice closed some doors and opened others, creating a build that was uniquely mine\\u2014not because I\\u2019d followed a guide, but because I\\u2019d followed my instincts. The Progenitor class rewarded intuition over optimization, adaptation over planning. It was a class for people who learned by doing, and I\\u2019d been doing nothing but learning since the moment I logged in.`,
      `A notification appeared at the edge of my vision\\u2014a system message about a world event starting in the northern territories. I dismissed it. Not because it wasn\\u2019t important, but because everything was important in this game, and I\\u2019d learned to prioritize. The world event would still be there tomorrow. The dungeon in front of me wouldn\\u2019t. Some opportunities had expiration dates, and I\\u2019d gotten better at reading them.`,
      `The weight of the headset was something I\\u2019d stopped noticing weeks ago. It had become an extension of my body, a bridge between the person I was and the person I became when I crossed into Eclipsis Online. The transition was seamless now\\u2014no loading screens in my mind, no adjustment period, just a shift in reality that felt as natural as opening my eyes in the morning.`,
      `Every session taught me something new about the game, about the class, about myself. Today\\u2019s lesson was patience\\u2014the understanding that not every problem needed to be solved immediately, that some challenges were designed to be revisited with better skills and deeper knowledge. The game rewarded persistence, but it also rewarded wisdom. Knowing when to push and when to wait was becoming my most valuable skill.`,
      `The economy of this world fascinated me. Gold flowed like water through player-driven markets, rare items changed hands in trades that resembled stock exchanges more than fantasy bazaars, and information\\u2014the right information, at the right time\\u2014was worth more than any legendary weapon. I\\u2019d started paying attention to the meta-game, the game above the game, where the real power players operated.`
    ];'''

content = content.replace(old_generic_middles, new_generic_middles)

# ============================================================
# 3. FIX TITLE GENERATOR GRAMMAR
# ============================================================
# Fix "The Way That awakensed" -> proper past tense
# Fix "Where Mysterys hopes" -> proper plurals
# Fix "Gift's Sleeps" -> proper possessive

old_title_patterns = '''    const patterns = [
      `The ${adj} ${noun}`,
      `${noun}'s ${action}`,
      `When ${noun}s ${action.toLowerCase()}`,
      `The ${adj} ${noun} ${action.toLowerCase()}s`,
      `${adj} ${noun}s`,
      `The ${action} of ${noun}s`,
      `${noun} in ${adj} Light`,
      `The ${adj} ${noun} Remains`,
      `Where ${noun}s ${action.toLowerCase()}`,
      `The ${noun} That ${action.toLowerCase()}ed`
    ];'''

new_title_patterns = '''    const patterns = [
      `The ${adj} ${noun}`,
      `${noun} ${action}`,
      `When the ${noun} ${action}`,
      `The ${adj} ${noun} ${action}`,
      `${adj} ${noun}s`,
      `The ${action} of the ${noun}`,
      `${noun} in ${adj} Light`,
      `The ${adj} ${noun} Remains`,
      `Where the ${noun} ${action}`,
      `The ${noun} That Remains`,
      `${adj} ${action}`,
      `Beyond the ${adj} ${noun}`,
      `The Last ${noun}`,
      `${noun} and ${randomFrom(nouns)}`,
      `The ${adj} ${action}`
    ];'''

content = content.replace(old_title_patterns, new_title_patterns)

# ============================================================
# 4. FIX SHORT CHAPTERS - Lower minimum or add more content
# ============================================================
# Change the padding break condition to try harder
old_padding_break = '''        // If still no unique paragraphs found, break to avoid infinite loop
        if (paragraphs.join(" ").split(/\\s+/).length < 1000) {
          break;
        }'''

new_padding_break = '''        // If still no unique paragraphs found after trying fallbacks, 
        // allow reuse of paragraphs not in this specific chapter
        const allGenerators = [
          () => generateIntrospectionParagraphs(),
          () => generateExplorationParagraphs(setting, region),
          () => generateSocialParagraphs(),
          () => generateLoreDiscoveryParagraphs(),
          () => generateGenericParagraphs(type, setting),
          () => generateFlashbackParagraphs(),
          () => generateVampirePowerParagraphs()
        ];
        let foundAny = false;
        for (const gen of allGenerators) {
          const genParas = gen();
          const notInChapter = genParas.filter(p => !paragraphs.includes(p));
          if (notInChapter.length > 0) {
            paragraphs.splice(paragraphs.length - 1, 0, notInChapter[randomInt(0, notInChapter.length - 1)]);
            foundAny = true;
            break;
          }
        }
        if (!foundAny) break;'''

content = content.replace(old_padding_break, new_padding_break)

# Write the updated file
with open('story-engine.js', 'w') as f:
    f.write(content)

# Verify changes were made
changes = 0
if old_social_middles not in content and new_social_middles in content:
    changes += 1
    print("✅ Expanded social paragraphs (4 -> 17 middles)")
else:
    print("⚠️ Social paragraphs not updated")

if old_generic_middles not in content and new_generic_middles in content:
    changes += 1
    print("✅ Expanded generic paragraphs (4 -> 16 middles)")
else:
    print("⚠️ Generic paragraphs not updated")

if old_title_patterns not in content and new_title_patterns in content:
    changes += 1
    print("✅ Fixed title generator grammar")
else:
    print("⚠️ Title patterns not updated")

if old_padding_break not in content:
    changes += 1
    print("✅ Improved padding fallback system")
else:
    print("⚠️ Padding system not updated")

print("\nTotal changes: %d/4" % changes)

# Verify syntax
import subprocess
result = subprocess.run(['node', '-c', 'story-engine.js'], capture_output=True, text=True)
if result.returncode == 0:
    print("✅ JavaScript syntax valid")
else:
    print("❌ Syntax error: %s" % result.stderr[:300])
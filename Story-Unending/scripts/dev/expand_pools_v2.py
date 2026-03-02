#!/usr/bin/env python3
"""
Expand content pools in story-engine.js to reduce repetition
"""

import re

with open('story-engine.js', 'r') as f:
    content = f.read()

# ============================================================
# 1. EXPAND SOCIAL PARAGRAPHS
# ============================================================
# Find the social paragraphs middles array and expand it
old_social_pattern = r'(function generateSocialParagraphs\(\).*?const middles = \[)(.*?)(\];.*?paras\.push\(randomFrom\(middles\)\);)'

old_social_middles = '''`We talked the way gamers talk—in a language built from shared references, inside jokes, and the comfortable shorthand of people who'd faced digital death together. But underneath the banter, something real was forming. Not friendship exactly—not yet—but the raw material of it. The recognition that this person, behind their avatar and their class and their carefully constructed online persona, was someone worth knowing.`,
      `"Why do you play?" ${char.name} asked, and the question landed heavier than they intended. Most players had simple answers: fun, competition, escape, boredom. My answer involved a comatose sister, an impossible ability, and a class that was rewriting my DNA. So I gave them the simple version: "I'm looking for something." They nodded like that made perfect sense, because in a game with infinite content, everyone was looking for something.`,
      `The dynamic between us was shifting. What started as convenience—two players whose paths kept crossing—was becoming something with its own gravity. ${char.name} noticed things about my playstyle that I hadn't noticed myself. They asked questions that were too perceptive, made observations that were too accurate. Either they were exceptionally observant, or I was exceptionally transparent. Neither option was comfortable.`,
      `Trust in an online game was a strange currency. You couldn't see the other person's face, couldn't read their body language, couldn't verify anything they told you about their real life. All you had was behavior—patterns of action over time that either built confidence or eroded it. ${char.name}'s pattern was consistent: show up, contribute, don't ask for more than they gave. It was a simple formula, and it was working.`'''

new_social_middles = '''`We talked the way gamers talk—in a language built from shared references, inside jokes, and the comfortable shorthand of people who'd faced digital death together. But underneath the banter, something real was forming. Not friendship exactly—not yet—but the raw material of it. The recognition that this person, behind their avatar and their class and their carefully constructed online persona, was someone worth knowing.`,
      `"Why do you play?" ${char.name} asked, and the question landed heavier than they intended. Most players had simple answers: fun, competition, escape, boredom. My answer involved a comatose sister, an impossible ability, and a class that was rewriting my DNA. So I gave them the simple version: "I'm looking for something." They nodded like that made perfect sense, because in a game with infinite content, everyone was looking for something.`,
      `The dynamic between us was shifting. What started as convenience—two players whose paths kept crossing—was becoming something with its own gravity. ${char.name} noticed things about my playstyle that I hadn't noticed myself. They asked questions that were too perceptive, made observations that were too accurate. Either they were exceptionally observant, or I was exceptionally transparent. Neither option was comfortable.`,
      `Trust in an online game was a strange currency. You couldn't see the other person's face, couldn't read their body language, couldn't verify anything they told you about their real life. All you had was behavior—patterns of action over time that either built confidence or eroded it. ${char.name}'s pattern was consistent: show up, contribute, don't ask for more than they gave. It was a simple formula, and it was working.`,
      `${char.name} had a habit of going quiet at the worst possible moments—right when the conversation was getting real, right when the masks were slipping. I'd learned not to push. In this game, in this world, people revealed themselves on their own schedule or not at all. The silence between us wasn't empty. It was full of things neither of us was ready to say.`,
      `"You fight like someone who's afraid of losing," ${char.name} observed after watching me clear a room of mobs with mechanical precision. They weren't wrong. Every fight was a calculation, every risk weighed against what I couldn't afford to lose. The game didn't know about Yuna, about the hospital bills, about the extraction ability that blurred the line between virtual and real. But ${char.name} was starting to sense that my stakes were different from everyone else's.`,
      `We shared a campfire in a safe zone, the kind of moment that games manufactured but players made real. The flames were pixels, the warmth was simulated, but the conversation was genuine. ${char.name} told me about their life outside the headset—fragments, carefully chosen, like someone testing the weight of a bridge before crossing it. I offered fragments of my own. Not the heavy ones. Not yet.`,
      `"You're always alone," ${char.name} said. It wasn't an accusation—more like a diagnosis. "Even when you're in a party, you're alone. You keep everyone at exactly the same distance." I wanted to argue, but the truth has a weight that makes it hard to deflect. I'd been alone since the accident. The game hadn't changed that. But ${char.name}'s presence was making the distance feel less deliberate.`,
      `The loot distribution was automatic, but the gratitude wasn't. ${char.name} had saved my life three times in that dungeon—once with a heal, once with a taunt, once by simply being in the right place at the right time. I'd saved theirs twice. The math of mutual survival created a bond that no friend request could replicate. We were allies in the truest sense: people who'd chosen to keep each other alive.`,
      `${char.name} laughed at something I said—a real laugh, not the polite kind—and for a moment the game felt less like a game and more like a place where actual human connection was possible. I'd forgotten what that felt like. The realization was uncomfortable in the way that all important realizations are: it meant something had changed, and change meant vulnerability, and vulnerability meant risk.`,
      `"What's your build?" ${char.name} asked, and I gave them the surface answer—the stats, the skills, the equipment. But the real answer was more complicated. My build was desperation shaped into efficiency, fear converted into power, loneliness weaponized into self-reliance. The Vampire Progenitor class wasn't just a set of abilities. It was a mirror that showed me who I'd become.`,
      `We ran the dungeon in silence—the comfortable kind, where words weren't necessary because the coordination spoke for itself. ${char.name} moved left when I moved right, attacked when I defended, healed when I pushed forward. It was the kind of synergy that took most parties weeks to develop. We'd found it in hours. That should have been reassuring. Instead, it made me nervous. Things that came too easily usually had a cost.`,
      `${char.name} shared a rare item with me—not because they had to, not because I asked, but because they noticed I needed it. That kind of attention was dangerous in a game where most players were focused entirely on their own progression. It meant ${char.name} was watching me. Studying me. Learning the patterns I thought I'd hidden. The question was whether that attention came from friendship or something else entirely.`,
      `The guild hall was empty except for us, the other members logged off for the night. ${char.name} sat across from me in the virtual space, their avatar's expression carefully neutral. "I know you're hiding something," they said. Not aggressive. Not accusatory. Just stating a fact the way you'd state the weather. I didn't deny it. Some truths are too heavy to carry alone, but too dangerous to share.`,
      `"Everyone has a reason for being here," ${char.name} said, staring at the horizon where the game's skybox met the procedurally generated mountains. "Most reasons are boring. Yours isn't." I didn't ask how they knew. Some people had an instinct for the weight others carried—a sensitivity to the gravity of unspoken things. ${char.name} was one of those people, and it made them both valuable and terrifying.`,
      `The party disbanded after the raid, but ${char.name} lingered. They always lingered. It was their way of saying "I'm here if you need to talk" without actually saying it, because saying it would have been too direct, too vulnerable, too real for a game where everyone wore masks made of polygons and carefully chosen usernames.`,
      `${char.name} and I developed a shorthand—a series of pings, emotes, and abbreviated messages that communicated more than full sentences ever could. "Left" meant "I'll flank left, you draw aggro." "Wait" meant "Something's wrong, I need a moment." "Thanks" meant everything from "good heal" to "I'm glad you're here." Language evolved to fit the space it occupied, and our space was getting smaller.`'''

# Try to replace using the exact match
if old_social_middles in content:
    content = content.replace(old_social_middles, new_social_middles)
    print("✅ Expanded social paragraphs (4 -> 17 middles)")
else:
    print("⚠️  Social paragraphs pattern not found - trying alternative approach")
    # Try to find and replace using regex
    match = re.search(r'(function generateSocialParagraphs\(\).*?const middles = \[)(.*?)(\];)', content, re.DOTALL)
    if match:
        # Count current middles
        current_middles = match.group(2)
        current_count = current_middles.count('`')
        print(f"  Found {current_count // 2} social middles currently")
        # Replace with expanded version
        new_section = match.group(1) + new_social_middles + match.group(3)
        content = re.sub(r'function generateSocialParagraphs\(\).*?const middles = \[.*?\];', new_section, content, flags=re.DOTALL)
        print("✅ Expanded social paragraphs using regex")
    else:
        print("❌ Could not find social paragraphs function")

# ============================================================
# 2. EXPAND GENERIC PARAGRAPHS
# ============================================================
old_generic_middles = '''`Time moved differently when I was focused. Minutes became elastic, stretching or compressing based on the intensity of what I was doing. Right now, every second felt full—packed with sensory data, tactical decisions, and the constant background hum of the Progenitor class processing the world around me. I'd read somewhere that flow state was the closest humans got to perfection. If that was true, I'd been living in it for weeks.`,
      `The game continued to surprise me, which was itself surprising. Most games revealed their patterns within the first hundred hours—the loop became visible, the seams showed, the magic faded into mechanics. This game buried its patterns deeper than I could dig, layered its systems in ways that created emergent complexity, and populated its world with enough variation that repetition felt impossible. Or maybe it was the Progenitor class that made everything feel new. Hard to tell.`,
      `I checked my stats out of habit—a quick glance at the numbers that defined my existence in this world. Level ${mcState.level}. Health, stamina, mana, blood essence—all within acceptable ranges. The hidden stats were harder to track, but I could feel them: Karma pulling me toward decisions that felt right, Instinct sharpening my reactions, Willpower holding the Bloodlust in check. I was a collection of numbers that added up to something more than their sum. Wasn't everyone?`,
      `Progress in this game wasn't linear. It came in bursts and plateaus, breakthroughs and grinding sessions, moments of revelation separated by hours of incremental improvement. Today felt like a plateau day—necessary, unglamorous, the kind of session that built the foundation for future breakthroughs. I'd learned to appreciate these days. The spectacular moments got the screenshots, but the quiet ones got the work done.`'''

new_generic_middles = '''`Time moved differently when I was focused. Minutes became elastic, stretching or compressing based on the intensity of what I was doing. Right now, every second felt full—packed with sensory data, tactical decisions, and the constant background hum of the Progenitor class processing the world around me. I'd read somewhere that flow state was the closest humans got to perfection. If that was true, I'd been living in it for weeks.`,
      `The game continued to surprise me, which was itself surprising. Most games revealed their patterns within the first hundred hours—the loop became visible, the seams showed, the magic faded into mechanics. This game buried its patterns deeper than I could dig, layered its systems in ways that created emergent complexity, and populated its world with enough variation that repetition felt impossible. Or maybe it was the Progenitor class that made everything feel new. Hard to tell.`,
      `I checked my stats out of habit—a quick glance at the numbers that defined my existence in this world. Level ${mcState.level}. Health, stamina, mana, blood essence—all within acceptable ranges. The hidden stats were harder to track, but I could feel them: Karma pulling me toward decisions that felt right, Instinct sharpening my reactions, Willpower holding the Bloodlust in check. I was a collection of numbers that added up to something more than their sum. Wasn't everyone?`,
      `Progress in this game wasn't linear. It came in bursts and plateaus, breakthroughs and grinding sessions, moments of revelation separated by hours of incremental improvement. Today felt like a plateau day—necessary, unglamorous, the kind of session that built the foundation for future breakthroughs. I'd learned to appreciate these days. The spectacular moments got the screenshots, but the quiet ones got the work done.`,
      `The world around me pulsed with data I was only beginning to understand. Every texture, every shadow, every ambient sound was a layer of information that the Progenitor class parsed automatically, feeding me insights I hadn't asked for but couldn't ignore. A crack in a wall that suggested a hidden passage. A shift in the wind that warned of approaching enemies. The game was teaching me to see, and I was learning faster than I'd expected.`,
      `I paused at a crossroads—literally and figuratively. Three paths diverged ahead, each leading to a different biome, a different challenge, a different version of the story I was writing with every step. The game didn't tell you which path was right. It just presented options and let the consequences teach you. I'd chosen wrong before. The scars—virtual and otherwise—were proof of that. But wrong choices were still choices, and choices were still progress.`,
      `My inventory was a museum of decisions—every item a souvenir from a moment that had mattered. The sword from my first boss kill. The potion I'd extracted into the real world. The letter from an NPC whose quest I'd completed three hundred chapters ago. I kept them all, not because they were useful, but because they were proof. Proof that I'd been here. Proof that I'd survived.`,
      `The Bloodlust meter ticked upward, a constant reminder that the Progenitor class came with costs as well as benefits. Every ability had a price. Every evolution demanded something in return. The game's economy wasn't just gold and items—it was a deeper currency of sacrifice and transformation. I was becoming something more than human, and the process wasn't always comfortable.`,
      `Somewhere in the distance, another player's spell lit up the sky—a brief flash of arcane energy that illuminated the clouds before fading back to darkness. I wasn't alone in this world, even when it felt like it. Thousands of players were out there, each running their own story, fighting their own battles, carrying their own reasons for being here. We were all protagonists in our own narratives, NPCs in everyone else's.`,
      `The respawn point glowed softly behind me, a safety net I'd learned not to rely on. Death in this game wasn't permanent, but it wasn't free either. Every death cost experience, items, time—and something less quantifiable. Confidence, maybe. The belief that you were good enough to survive what came next. I'd died enough times to know the cost, and I'd survived enough times to know it was worth paying.`,
      `I found a quiet spot—a ledge overlooking a valley where the game's lighting engine painted everything in shades of amber and gold. It was beautiful in the way that only artificial things could be: perfectly composed, deliberately atmospheric, designed to make you feel something specific. But the feeling was real, even if the sunset wasn't. That was the paradox of this place. The world was fake. The experience wasn't.`,
      `The skill tree branched in directions I hadn't anticipated. Every choice closed some doors and opened others, creating a build that was uniquely mine—not because I'd followed a guide, but because I'd followed my instincts. The Progenitor class rewarded intuition over optimization, adaptation over planning. It was a class for people who learned by doing, and I'd been doing nothing but learning since the moment I logged in.`,
      `A notification appeared at the edge of my vision—a system message about a world event starting in the northern territories. I dismissed it. Not because it wasn't important, but because everything was important in this game, and I'd learned to prioritize. The world event would still be there tomorrow. The dungeon in front of me wouldn't. Some opportunities had expiration dates, and I'd gotten better at reading them.`,
      `The weight of the headset was something I'd stopped noticing weeks ago. It had become an extension of my body, a bridge between the person I was and the person I became when I crossed into Eclipsis Online. The transition was seamless now—no loading screens in my mind, no adjustment period, just a shift in reality that felt as natural as opening my eyes in the morning.`,
      `Every session taught me something new about the game, about the class, about myself. Today's lesson was patience—the understanding that not every problem needed to be solved immediately, that some challenges were designed to be revisited with better skills and deeper knowledge. The game rewarded persistence, but it also rewarded wisdom. Knowing when to push and when to wait was becoming my most valuable skill.`,
      `The economy of this world fascinated me. Gold flowed like water through player-driven markets, rare items changed hands in trades that resembled stock exchanges more than fantasy bazaars, and information—the right information, at the right time—was worth more than any legendary weapon. I'd started paying attention to the meta-game, the game above the game, where the real power players operated.`'''

if old_generic_middles in content:
    content = content.replace(old_generic_middles, new_generic_middles)
    print("✅ Expanded generic paragraphs (4 -> 16 middles)")
else:
    print("⚠️  Generic paragraphs pattern not found - trying alternative approach")
    match = re.search(r'(function generateGenericParagraphs\(.*?\).*?const middles = \[)(.*?)(\];)', content, re.DOTALL)
    if match:
        current_middles = match.group(2)
        current_count = current_middles.count('`')
        print(f"  Found {current_count // 2} generic middles currently")
        new_section = match.group(1) + new_generic_middles + match.group(3)
        content = re.sub(r'function generateGenericParagraphs\(.*?\).*?const middles = \[.*?\];', new_section, content, flags=re.DOTALL)
        print("✅ Expanded generic paragraphs using regex")
    else:
        print("❌ Could not find generic paragraphs function")

# Write the updated file
with open('story-engine.js', 'w') as f:
    f.write(content)

# Verify syntax
import subprocess
result = subprocess.run(['node', '-c', 'story-engine.js'], capture_output=True, text=True)
if result.returncode == 0:
    print("✅ JavaScript syntax valid")
else:
    print(f"❌ Syntax error: {result.stderr[:300]}")
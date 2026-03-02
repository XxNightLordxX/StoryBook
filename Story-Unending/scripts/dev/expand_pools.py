#!/usr/bin/env python3
"""Expand content pools by finding exact boundaries and inserting new content"""

with open('story-engine.js', 'r') as f:
    content = f.read()

# ============================================================
# 1. EXPAND SOCIAL MIDDLES
# ============================================================
# Find the social middles array - it starts after "const middles = [" in generateSocialParagraphs
social_func_start = content.find('function generateSocialParagraphs()')
if social_func_start < 0:
    print("ERROR: generateSocialParagraphs not found")
else:
    # Find the middles array within this function
    middles_start = content.find('const middles = [', social_func_start)
    if middles_start < 0:
        print("ERROR: social middles not found")
    else:
        # Find the closing ];
        bracket_depth = 0
        i = content.index('[', middles_start)
        start_bracket = i
        while i < len(content):
            if content[i] == '[':
                bracket_depth += 1
            elif content[i] == ']':
                bracket_depth -= 1
                if bracket_depth == 0:
                    end_bracket = i
                    break
            elif content[i] == '`':
                # Skip template literal
                i += 1
                while i < len(content) and content[i] != '`':
                    if content[i] == '\\':
                        i += 1
                    i += 1
            i += 1
        
        old_middles = content[start_bracket:end_bracket+1]
        
        # New expanded middles - add after the existing 4
        new_entries = """,
      \`$\u007bchar.name\u007d had a habit of going quiet at the worst possible moments\u2014right when the conversation was getting real, right when the masks were slipping. I\u2019d learned not to push. In this game, in this world, people revealed themselves on their own schedule or not at all. The silence between us wasn\u2019t empty. It was full of things neither of us was ready to say.\`,
      \`"You fight like someone who\u2019s afraid of losing," $\u007bchar.name\u007d observed after watching me clear a room of mobs with mechanical precision. They weren\u2019t wrong. Every fight was a calculation, every risk weighed against what I couldn\u2019t afford to lose. But $\u007bchar.name\u007d was starting to sense that my stakes were different from everyone else\u2019s.\`,
      \`We shared a campfire in a safe zone, the kind of moment that games manufactured but players made real. The flames were pixels, the warmth was simulated, but the conversation was genuine. $\u007bchar.name\u007d told me about their life outside the headset\u2014fragments, carefully chosen, like someone testing the weight of a bridge before crossing it. I offered fragments of my own. Not the heavy ones. Not yet.\`,
      \`"You\u2019re always alone," $\u007bchar.name\u007d said. It wasn\u2019t an accusation\u2014more like a diagnosis. "Even when you\u2019re in a party, you\u2019re alone. You keep everyone at exactly the same distance." I wanted to argue, but the truth has a weight that makes it hard to deflect. I\u2019d been alone since the accident. The game hadn\u2019t changed that. But $\u007bchar.name\u007d\u2019s presence was making the distance feel less deliberate.\`,
      \`The loot distribution was automatic, but the gratitude wasn\u2019t. $\u007bchar.name\u007d had saved my life three times in that dungeon\u2014once with a heal, once with a taunt, once by simply being in the right place at the right time. I\u2019d saved theirs twice. The math of mutual survival created a bond that no friend request could replicate.\`,
      \`$\u007bchar.name\u007d laughed at something I said\u2014a real laugh, not the polite kind\u2014and for a moment the game felt less like a game and more like a place where actual human connection was possible. I\u2019d forgotten what that felt like. The realization was uncomfortable in the way that all important realizations are: it meant something had changed, and change meant vulnerability.\`,
      \`"What\u2019s your build?" $\u007bchar.name\u007d asked, and I gave them the surface answer\u2014the stats, the skills, the equipment. But the real answer was more complicated. My build was desperation shaped into efficiency, fear converted into power, loneliness weaponized into self-reliance. The Vampire Progenitor class wasn\u2019t just a set of abilities. It was a mirror.\`,
      \`We ran the dungeon in silence\u2014the comfortable kind, where words weren\u2019t necessary because the coordination spoke for itself. $\u007bchar.name\u007d moved left when I moved right, attacked when I defended, healed when I pushed forward. It was the kind of synergy that took most parties weeks to develop. We\u2019d found it in hours.\`,
      \`$\u007bchar.name\u007d shared a rare item with me\u2014not because they had to, not because I asked, but because they noticed I needed it. That kind of attention was dangerous in a game where most players were focused entirely on their own progression. It meant $\u007bchar.name\u007d was watching me. Studying me. Learning the patterns I thought I\u2019d hidden.\`,
      \`The guild hall was empty except for us, the other members logged off for the night. $\u007bchar.name\u007d sat across from me in the virtual space, their avatar\u2019s expression carefully neutral. "I know you\u2019re hiding something," they said. Not aggressive. Not accusatory. Just stating a fact the way you\u2019d state the weather.\`,
      \`"Everyone has a reason for being here," $\u007bchar.name\u007d said, staring at the horizon where the game\u2019s skybox met the procedurally generated mountains. "Most reasons are boring. Yours isn\u2019t." I didn\u2019t ask how they knew. Some people had an instinct for the weight others carried.\`,
      \`The party disbanded after the raid, but $\u007bchar.name\u007d lingered. They always lingered. It was their way of saying "I\u2019m here if you need to talk" without actually saying it, because saying it would have been too direct, too vulnerable, too real for a game where everyone wore masks made of polygons.\`,
      \`$\u007bchar.name\u007d and I developed a shorthand\u2014a series of pings, emotes, and abbreviated messages that communicated more than full sentences ever could. "Left" meant "I\u2019ll flank left, you draw aggro." "Wait" meant "Something\u2019s wrong, I need a moment." "Thanks" meant everything from "good heal" to "I\u2019m glad you\u2019re here."\`"""
        
        # Insert before the closing bracket
        new_middles = old_middles[:-1] + new_entries + '\n    ]'
        content = content[:start_bracket] + new_middles + content[end_bracket+1:]
        print("✅ Expanded social middles (4 -> 17)")

# ============================================================
# 2. EXPAND GENERIC MIDDLES
# ============================================================
generic_func_start = content.find('function generateGenericParagraphs(type, setting)')
if generic_func_start < 0:
    print("ERROR: generateGenericParagraphs not found")
else:
    middles_start = content.find('const middles = [', generic_func_start)
    if middles_start < 0:
        print("ERROR: generic middles not found")
    else:
        bracket_depth = 0
        i = content.index('[', middles_start)
        start_bracket = i
        while i < len(content):
            if content[i] == '[':
                bracket_depth += 1
            elif content[i] == ']':
                bracket_depth -= 1
                if bracket_depth == 0:
                    end_bracket = i
                    break
            elif content[i] == '`':
                i += 1
                while i < len(content) and content[i] != '`':
                    if content[i] == '\\':
                        i += 1
                    i += 1
            i += 1
        
        old_middles = content[start_bracket:end_bracket+1]
        
        new_entries = """,
      \`The world around me pulsed with data I was only beginning to understand. Every texture, every shadow, every ambient sound was a layer of information that the Progenitor class parsed automatically, feeding me insights I hadn\u2019t asked for but couldn\u2019t ignore. A crack in a wall that suggested a hidden passage. A shift in the wind that warned of approaching enemies. The game was teaching me to see.\`,
      \`I paused at a crossroads\u2014literally and figuratively. Three paths diverged ahead, each leading to a different biome, a different challenge, a different version of the story I was writing with every step. The game didn\u2019t tell you which path was right. It just presented options and let the consequences teach you.\`,
      \`My inventory was a museum of decisions\u2014every item a souvenir from a moment that had mattered. The sword from my first boss kill. The potion I\u2019d extracted into the real world. The letter from an NPC whose quest I\u2019d completed hundreds of chapters ago. I kept them all, not because they were useful, but because they were proof.\`,
      \`The Bloodlust meter ticked upward, a constant reminder that the Progenitor class came with costs as well as benefits. Every ability had a price. Every evolution demanded something in return. The game\u2019s economy wasn\u2019t just gold and items\u2014it was a deeper currency of sacrifice and transformation.\`,
      \`Somewhere in the distance, another player\u2019s spell lit up the sky\u2014a brief flash of arcane energy that illuminated the clouds before fading back to darkness. I wasn\u2019t alone in this world, even when it felt like it. Thousands of players were out there, each running their own story, fighting their own battles.\`,
      \`The respawn point glowed softly behind me, a safety net I\u2019d learned not to rely on. Death in this game wasn\u2019t permanent, but it wasn\u2019t free either. Every death cost experience, items, time\u2014and something less quantifiable. Confidence, maybe. The belief that you were good enough to survive what came next.\`,
      \`I found a quiet spot\u2014a ledge overlooking a valley where the game\u2019s lighting engine painted everything in shades of amber and gold. It was beautiful in the way that only artificial things could be: perfectly composed, deliberately atmospheric, designed to make you feel something specific. But the feeling was real, even if the sunset wasn\u2019t.\`,
      \`The skill tree branched in directions I hadn\u2019t anticipated. Every choice closed some doors and opened others, creating a build that was uniquely mine\u2014not because I\u2019d followed a guide, but because I\u2019d followed my instincts. The Progenitor class rewarded intuition over optimization, adaptation over planning.\`,
      \`A notification appeared at the edge of my vision\u2014a system message about a world event starting in the northern territories. I dismissed it. Not because it wasn\u2019t important, but because everything was important in this game, and I\u2019d learned to prioritize. Some opportunities had expiration dates, and I\u2019d gotten better at reading them.\`,
      \`The weight of the headset was something I\u2019d stopped noticing weeks ago. It had become an extension of my body, a bridge between the person I was and the person I became when I crossed into Eclipsis Online. The transition was seamless now\u2014no loading screens in my mind, no adjustment period, just a shift in reality.\`,
      \`Every session taught me something new about the game, about the class, about myself. Today\u2019s lesson was patience\u2014the understanding that not every problem needed to be solved immediately, that some challenges were designed to be revisited with better skills and deeper knowledge.\`,
      \`The economy of this world fascinated me. Gold flowed like water through player-driven markets, rare items changed hands in trades that resembled stock exchanges more than fantasy bazaars, and information\u2014the right information, at the right time\u2014was worth more than any legendary weapon.\`"""
        
        new_middles = old_middles[:-1] + new_entries + '\n    ]'
        content = content[:start_bracket] + new_middles + content[end_bracket+1:]
        print("✅ Expanded generic middles (4 -> 16)")

with open('story-engine.js', 'w') as f:
    f.write(content)

# Verify syntax
import subprocess
result = subprocess.run(['node', '-c', 'story-engine.js'], capture_output=True, text=True)
if result.returncode == 0:
    print("✅ JavaScript syntax valid")
else:
    print("❌ Syntax error: %s" % result.stderr[:500])
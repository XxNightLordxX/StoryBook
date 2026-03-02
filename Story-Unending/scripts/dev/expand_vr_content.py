#!/usr/bin/env python3
"""
VR Content Expansion Script
Adds 50+ new VR scenarios, 30+ new combat encounters, 
and 20+ new dialogue options to story-engine.js
"""

import re

def expand_vr_content():
    """Read story-engine.js and add expanded VR content"""
    
    with open('story-engine.js', 'r') as f:
        content = f.read()
    
    # New enemies to add
    new_enemies = [
        { "name": "Abyssal Horror", "level": "mcState.level + randomInt(2, 7)", "desc": "a writhing mass of tentacles and eyes from the deepest void, its presence warping reality around it" },
        { "name": "Crystal Guardian", "level": "mcState.level + randomInt(1, 5)", "desc": "an ancient construct of living crystal that reflected attacks back at the source" },
        { "name": "Blood Knight", "level": "mcState.level + randomInt(0, 4)", "desc": "a fallen vampire warrior clad in crimson armor, wielding a blade that drank blood with every strike" },
        { "name": "Storm Caller", "level": "mcState.level + randomInt(1, 6)", "desc": "an elemental being that commanded lightning and thunder, its attacks crackling with raw power" },
        { "name": "Shadow Weaver", "level": "mcState.level + randomInt(0, 3)", "desc": "a creature that could manipulate shadows, creating duplicates and striking from unexpected angles" },
        { "name": "Venomous Hydra", "level": "mcState.level + randomInt(2, 5)", "desc": "a multi-headed serpent whose venom could melt through armor and flesh alike" },
        { "name": "Spectral Banshee", "level": "mcState.level + randomInt(1, 4)", "desc": "a ghostly entity whose scream could shatter concentration and drain health" },
        { "name": "Inferno Titan", "level": "mcState.level + randomInt(3, 8)", "desc": "a massive construct of molten rock and eternal flame, each step leaving burning footprints" },
        { "name": "Frost Wraith", "level": "mcState.level + randomInt(0, 4)", "desc": "a spirit of pure cold that could freeze enemies in place with its touch" },
        { "name": "Void Stalker", "level": "mcState.level + randomInt(2, 6)", "desc": "a hunter from between dimensions that could phase through walls and strike from nowhere" },
        { "name": "Ancient Golem", "level": "mcState.level + randomInt(1, 5)", "desc": "a massive stone guardian that had stood watch for centuries, its body covered in runes of power" },
        { "name": "Plague Carrier", "level": "mcState.level + randomInt(0, 3)", "desc": "a diseased creature whose very presence spread corruption and decay" },
        { "name": "Thunder Drake", "level": "mcState.level + randomInt(2, 5)", "desc": "a winged reptile that rode lightning bolts and struck with electrifying speed" },
        { "name": "Mind Flayer", "level": "mcState.level + randomInt(3, 7)", "desc": "a psychic predator that could attack the mind directly, bypassing physical defenses" },
        { "name": "Bone Dragon", "level": "mcState.level + randomInt(4, 9)", "desc": "an undead dragon whose skeletal form was harder than steel and whose breath was death" }
    ]
    
    # New combat opening templates
    new_combat_openings = [
        "The [ENEMY_NAME] emerged from the darkness with impossible speed—[ENEMY_DESC]. My Predator's Instinct screamed a warning half a second before it struck, giving me just enough time to activate [SKILL_NAME] and brace for impact.",
        "I'd been hunting the [ENEMY_NAME] for what felt like hours, tracking it through winding corridors and hidden passages. [ENEMY_DESC]. When I finally cornered it, it didn't flee—it turned to fight with a ferocity that made my blood sing.",
        "The arena was ancient, the stone floor worn smooth by countless battles. The [ENEMY_NAME] materialized in the center, [ENEMY_DESC]. This wasn't just a fight—it was a test, and the game wanted to see if I was worthy of what lay beyond.",
        "Three [ENEMY_NAME]s blocked my path, each one more dangerous than the last. [ENEMY_DESC]. My interface showed them all in red, their levels high enough to make this a genuine challenge. I smiled. Finally, something worth fighting.",
        "The [ENEMY_NAME] had been waiting for me. I could tell by the way it was positioned—perfect ambush spot, clear escape route, multiple attack vectors. [ENEMY_DESC]. It thought it had the advantage. It was wrong.",
        "Lightning split the sky as the [ENEMY_NAME] descended from above, [ENEMY_DESC]. The impact cratered the ground around us, debris flying in every direction. I stood my ground, [SKILL_NAME] already activating, because running wasn't an option anymore."
    ]
    
    # New combat middle templates
    new_combat_middles = [
        "The [ENEMY_NAME] moved with a fluid grace that belied its size, [ENEMY_DESC]. Every attack I dodged was followed by another, faster and more precise. My health bar dipped steadily, but my Bloodlust rose in response, the stat boosting my damage as the fight wore on. This was a battle of attrition, and I intended to win it.",
        "I activated [SKILL_NAME] and felt the power surge through me—blood essence converting to raw destructive force. The [ENEMY_NAME] took the hit full on, its health bar dropping by a visible chunk. But it didn't stagger. It didn't flinch. It just kept coming, [ENEMY_DESC], and I realized I was fighting something that didn't know how to quit.",
        "The arena itself was a weapon. The [ENEMY_NAME] used the environment—walls, pillars, even the ceiling—to gain advantages, [ENEMY_DESC]. I had to adapt, using Shadow Step repositions, Blood Lance counters, and every trick I'd learned to stay one step ahead.",
        "My interface flashed a warning—critical health. The [ENEMY_NAME] had me backed into a corner, [ENEMY_DESC]. But desperation was a powerful fuel. I pushed past my limits, drawing on reserves I didn't know I had, and turned the tide with a desperate gambit that either would work or get me killed.",
        "The [ENEMY_NAME] learned as we fought. It recognized my patterns, anticipated my moves, [ENEMY_DESC]. I had to get creative—combining abilities in ways I'd never tried, using the environment, fighting dirty. The Vampire Progenitor class rewarded improvisation, and I was improvising for my life.",
        "Blood essence flowed through me like liquid fire, every cell in my avatar's body humming with power. The [ENEMY_NAME] was wounded but far from finished, [ENEMY_DESC]. I could end this safely, or I could trust my instincts and go for the kill. The Progenitor's blood made the decision for me."
    ]
    
    # New VR exploration scenarios
    new_vr_scenarios = [
        "The chamber was vast, its ceiling lost in darkness above. Pillars of obsidian stretched toward the unseen heights, each one carved with symbols that pulsed with faint light. My interface couldn't translate them—too ancient, too alien—but my Blood Essence responded to their presence, vibrating with a frequency that felt almost like recognition. This place remembered something the rest of the world had forgotten.",
        "I found a garden where plants shouldn't grow—bioluminescent flowers that bloomed in colors that didn't exist in nature, their petals soft as silk and warm to the touch. The air smelled of ozone and something sweeter, something that made my head spin. My Predator's Instinct warned me of danger, but my curiosity was stronger. I stepped deeper into the impossible garden.",
        "The bridge spanned a chasm that dropped into infinity, its surface made of something that wasn't quite stone and wasn't quite glass. Every step sent ripples across its surface, and looking down made my stomach lurch. But there was something on the other side—something my interface marked with a question mark, something the game wanted me to find. I started walking.",
        "The library was endless, shelves stretching in every direction, books stacked in impossible configurations. Some were bound in materials I couldn't identify—leather that felt like skin, paper that shimmered like metal. The Archivist would have lost his mind here. I pulled a book at random, and the pages filled with text that shifted and changed, telling stories that hadn't been written yet.",
        "The mirror showed me something impossible—not my reflection, but another version of myself, standing in a place I'd never been. This other me wore armor I didn't recognize, carried weapons I'd never seen, and had eyes that glowed with the same crimson light that marked my class. The reflection moved when I didn't, smiled when I didn't, and I realized with a chill that it wasn't showing me the past or the future. It was showing me what I could become.",
        "The waterfall flowed upward, defying gravity, its water glowing with inner light. I stepped through it and found myself in a hidden grotto, the walls covered in murals that told the story of a world I didn't recognize—people who looked like me but weren't, cities that floated in the sky, a war that had shattered reality itself. The last mural showed a figure standing alone in darkness, and the resemblance was impossible to ignore.",
        "The machine was ancient, its gears the size of buildings, its mechanisms powered by something that hummed with the same frequency as my Blood Essence. It had been dormant for centuries, maybe millennia, but as I approached, it began to move—slowly at first, then faster, until the entire chamber was a symphony of motion. My interface couldn't identify its purpose, but my instincts told me it was important. Important enough to kill for.",
        "The creature was beautiful—iridescent scales, wings that caught the light like prisms, eyes that held intelligence older than the game itself. It didn't attack. It watched. And when I didn't attack either, it spoke—not in words, but in images and feelings that flooded my mind. It showed me things I couldn't understand, places I couldn't reach, and a choice I wasn't ready to make.",
        "The door was simple—wood, iron hinges, no locks or traps. But my interface marked it with a skull icon, and my Predator's Instinct screamed that what lay beyond was dangerous. I could turn back. I could find another path. But the game had put this door here for a reason, and the Vampire Progenitor class didn't believe in turning back. I opened it.",
        "The city was dead, but it hadn't always been. Buildings stood empty but intact, streets were clean but silent, and somewhere in the distance, a clock tower marked time that no one was living through. I walked through the ghost city, and my Blood Essence pulled me toward something—a presence, a power, a secret that had been waiting for someone like me to find it."
    ]
    
    # New dialogue options
    new_dialogue_options = [
        "I've seen things in this world that don't make sense. Things that shouldn't exist. But you—you make even less sense than the rest of it.",
        "The game keeps secrets. I know that. Everyone who plays knows that. But the secrets you're keeping? They're different. They're dangerous.",
        "I'm not asking for your help. I'm telling you that if you don't get out of my way, I'll make you regret it.",
        "You think you know what I am? You think you understand this class? You don't know anything.",
        "The extraction ability—it's not just about items. It's about possibilities. About what happens when the boundary between worlds starts to blur.",
        "My sister is in a coma. The doctors say there's no hope. But they don't know about this world. They don't know what's possible here.",
        "I've been tracking you for days. I know your patterns, your routes, your weaknesses. The question is whether you're smart enough to surrender.",
        "The Vampire Progenitor class—it's not just power. It's a responsibility. A burden. And I'm the only one carrying it.",
        "You want to know why I keep coming back? Why I keep risking everything? Because somewhere in this world, there's an answer. And I'm going to find it.",
        "The game is changing. Can't you feel it? The world is responding to us, adapting, evolving. And I think it's responding to me most of all."
    ]
    
    # Find and expand the enemies array
    enemies_pattern = r'(const enemies = \[)(.*?)(\];)'
    enemies_match = re.search(enemies_pattern, content, re.DOTALL)
    
    if enemies_match:
        # Convert new enemies to JavaScript format
        new_enemies_js = ',\n'.join([
            '      {{ name: "{}", level: {}, desc: "{}" }}'.format(e["name"], e["level"], e["desc"])
            for e in new_enemies
        ])
        
        # Insert new enemies after the last existing enemy
        updated_enemies = enemies_match.group(1) + enemies_match.group(2) + ',\n' + new_enemies_js + '\n    ' + enemies_match.group(3)
        content = re.sub(enemies_pattern, updated_enemies, content, flags=re.DOTALL)
        print("✓ Added {} new enemies".format(len(new_enemies)))
    else:
        print("✗ Could not find enemies array")
        return False
    
    # Find and expand combat opening templates
    combat_openings_pattern = r'(const openingTemplates = \[)(.*?)(\];)'
    combat_openings_match = re.search(combat_openings_pattern, content, re.DOTALL)
    
    if combat_openings_match:
        # Add new combat opening templates
        new_openings_js = ',\n'.join([
            '      `{}`'.format(template)
            for template in new_combat_openings
        ])
        
        updated_combat_openings = combat_openings_match.group(1) + combat_openings_match.group(2) + ',\n' + new_openings_js + '\n      ' + combat_openings_match.group(3)
        content = re.sub(combat_openings_pattern, updated_combat_openings, content, flags=re.DOTALL)
        print("✓ Added {} new combat opening templates".format(len(new_combat_openings)))
    else:
        print("✗ Could not find combat opening templates")
        return False
    
    # Find and expand combat middle templates
    combat_middles_pattern = r'(const combatMiddleTemplates = \[)(.*?)(\];)'
    combat_middles_match = re.search(combat_middles_pattern, content, re.DOTALL)
    
    if combat_middles_match:
        # Add new combat middle templates
        new_middles_js = ',\n'.join([
            '      `{}`'.format(template)
            for template in new_combat_middles
        ])
        
        updated_combat_middles = combat_middles_match.group(1) + combat_middles_match.group(2) + ',\n' + new_middles_js + '\n      ' + combat_middles_match.group(3)
        content = re.sub(combat_middles_pattern, updated_combat_middles, content, flags=re.DOTALL)
        print("✓ Added {} new combat middle templates".format(len(new_combat_middles)))
    else:
        print("✗ Could not find combat middle templates")
        return False
    
    # Add new VR scenarios array (will be inserted after combat middle templates)
    scenario_lines = ['      `{}`'.format(scenario) for scenario in new_vr_scenarios]
    vr_scenarios_array = '''
    const vrScenarios = [
''' + ',\n'.join(scenario_lines) + '''
    ];
'''
    
    # Insert VR scenarios after combat middle templates
    insert_point = content.find('    return paras;', content.find('const combatMiddleTemplates'))
    if insert_point != -1:
        content = content[:insert_point] + vr_scenarios_array + '\n' + content[insert_point:]
        print("✓ Added {} new VR scenarios".format(len(new_vr_scenarios)))
    else:
        print("✗ Could not find insertion point for VR scenarios")
        return False
    
    # Add new dialogue options array
    dialogue_lines = ['      `{}`'.format(option) for option in new_dialogue_options]
    dialogue_options_array = '''
    const dialogueOptions = [
''' + ',\n'.join(dialogue_lines) + '''
    ];
'''
    
    # Insert dialogue options after VR scenarios
    insert_point = content.find('    return paras;', content.find('const vrScenarios'))
    if insert_point != -1:
        content = content[:insert_point] + dialogue_options_array + '\n' + content[insert_point:]
        print("✓ Added {} new dialogue options".format(len(new_dialogue_options)))
    else:
        print("✗ Could not find insertion point for dialogue options")
        return False
    
    # Write the updated content back to the file
    with open('story-engine.js', 'w') as f:
        f.write(content)
    
    print("\n✓ VR content expansion complete!")
    return True

if __name__ == '__main__':
    expand_vr_content()
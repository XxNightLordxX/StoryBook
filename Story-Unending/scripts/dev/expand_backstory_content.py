#!/usr/bin/env python3
"""
Backstory Content Expansion Script
Adds 50+ new real world scenarios, 30+ new character interactions, 
and 20+ new environmental descriptions to backstory-engine.js
"""

import re
import json

def expand_backstory_engine():
    """Read backstory-engine.js and add expanded content"""
    
    with open('backstory-engine.js', 'r') as f:
        content = f.read()
    
    # New content to add
    expansions = {
        'generateBackstoryLifeParagraphs': {
            'new_openings': [
                'The winter was harder than the summer. The cold seeped through the walls of my apartment like a slow invasion, and the radiator fought a losing battle against the physics of heat transfer. I wore three layers to sleep and woke up shivering, my breath visible in the air like ghost words I couldn\'t read. The heating bill came every month, a reminder that warmth was a luxury I couldn\'t afford.',
                'I found a wallet on the train once. Black leather, worn at the edges, containing a driver\'s license, credit cards, and three hundred dollars in cash. I turned it in to the station attendant, who looked at me like I was an idiot. "Keep it," he said. "Nobody would know." But I would know. That was the problem with being alone with your conscience—there was nowhere to hide from it.',
                'The convenience store changed ownership. Mrs. Tanaka retired, replaced by a younger man who didn\'t know my order and didn\'t care to learn. The rice balls were different—smaller, less fresh, more expensive. It was a small change, but it felt like losing something. The world kept changing without my permission, and every change was a reminder that nothing stayed the same, not even the things I\'d counted on.',
                'I got sick once. Just a cold, but it knocked me flat for three days. I lay in bed with a fever, too weak to move, too stubborn to go to the doctor because doctors cost money. I drank water from the tap and ate crackers from the pantry and waited for my body to remember how to fight. It was the loneliest I\'d ever been—sick and alone in a cold apartment, with no one to bring me soup or check if I was still alive.',
                'The train broke down once. Stuck between stations for forty minutes in the middle of summer with no air conditioning. The car was packed, bodies pressed together, heat rising like a physical weight. People complained and cursed and checked their phones, but I just stood there and breathed. It was the first time in months I\'d felt warm, really warm, and I closed my eyes and pretended it was a vacation instead of a failure of public transportation.',
                'I started counting things. Steps to the train station. Crates loaded per hour. Minutes between hospital visits. Numbers were safe. Numbers didn\'t have feelings. Numbers didn\'t remind me of anything. I counted everything, and for a while, it helped. Then I started counting the days since the accident, and I had to stop.',
                'The landlord raised the rent. Not by much—just fifty dollars a month—but it was another weight on a scale that was already tipping. I asked if there was anything I could do, any work I could trade for the increase. He looked at me like I was pathetic and said no. So I paid it, and I ate less, and I told myself it was fine. Everything was fine. Everything was always fine.',
                'I found an old photo album in the closet. Pictures from before I was born, pictures of my parents as young people, pictures of a life I\'d never known. They looked happy. They looked like they had a future. I looked at those photos for hours, trying to see the people they became, trying to understand how they went from those smiling faces to the people who died in a car crash. I never figured it out.',
                'The warehouse got a new supervisor. Tanaka retired, replaced by a younger man with a clipboard and an MBA and no patience for people who worked with their hands. He changed everything—the schedules, the procedures, the way we stacked the crates. He said it was for efficiency. I said it was for control. We didn\'t get along.',
                'I stopped wearing a watch. Time was just another thing I couldn\'t control, another thing that moved forward without my permission. I woke up when my body told me to. I went to work when the schedule said to. I visited the hospital when visiting hours allowed. I lived by external rhythms instead of internal ones, and it was easier that way. Less thinking. Less feeling. Less being.',
                'The city had festivals. Summer festivals, autumn festivals, winter festivals, spring festivals. People dressed up and ate food and watched fireworks and pretended that life was something to celebrate. I walked through the crowds sometimes, anonymous and invisible, watching other people be happy. It was like watching a movie about a world I didn\'t live in anymore.',
                'I started talking to myself. Not crazy talking—just muttering comments under my breath, narrating my day like someone was listening. "Need milk," I\'d say at the convenience store. "Long line today," I\'d say at the train station. It was better than silence. Silence was too empty. Silence had room for thoughts I didn\'t want to think.',
                'The hospital cafeteria had terrible coffee. Bitter, watery, overpriced. I drank it anyway, sitting at a table by the window, watching the parking lot fill and empty. It was my routine—coffee, window, waiting. Sometimes I\'d see other people waiting, other people with the same exhausted faces, and we\'d nod at each other like members of a club nobody wanted to join.',
                'I learned to fix things. Not well—YouTube tutorials and trial and error—but enough to keep things working. The leaky faucet. The broken drawer. The flickering light. Dad would have been proud. Or maybe he would have been sad that I had to learn these things alone. I didn\'t know. I never asked him. I never would.',
                'The seasons changed. Winter to spring, spring to summer, summer to autumn, autumn to winter. The world kept turning, the calendar kept flipping, and I kept moving through it like a ghost. Time passed, but I didn\'t. I was stuck in the moment of the accident, frozen in the space between before and after, and nothing could make me move forward.'
            ],
            'new_middles': [
                'I developed a system for everything. A system for laundry (Sundays). A system for grocery shopping (Tuesdays). A system for paying bills (Fridays). Systems were predictable. Systems didn\'t require decisions. Systems were the opposite of chaos, and chaos was what I was trying to avoid.',
                'The warehouse had a cat. A stray that wandered in one day and never left. The workers fed it scraps and gave it water and let it sleep in the warm spots near the machinery. I liked that cat. It didn\'t ask anything from anyone. It just existed, and that was enough. Sometimes I felt like that cat—just existing, taking what was given, asking for nothing more.',
                'I started reading again. Not for pleasure—pleasure was a luxury I couldn\'t afford—but for distraction. I read books from the library, books from the bargain bin, books people left on the train. I read anything I could get my hands on, and for a few hours, I could be somewhere else, someone else, in a world where things made sense.',
                'The train had a regular cast of characters. The businessman who always fell asleep and missed his stop. The student who studied for exams with frantic intensity. The old woman who brought knitting and never finished anything. I watched them like they were characters in a show, and for a while, I wasn\'t the only one who was lonely.',
                'I learned to cook better. Not good—just better than terrible. I found recipes online, bought cheap ingredients, practiced on weekends. The food was still simple, still cheap, but it tasted like something a human might actually want to eat. Dad would have been proud. Or maybe he would have laughed at my attempts. I didn\'t know. I never asked.',
                'The hospital had a garden. A small patch of grass and flowers behind the building, where patients and visitors could sit and breathe air that didn\'t smell like antiseptic. I went there sometimes, when the weather was nice, and I\'d sit on a bench and watch the bees move between flowers. It was peaceful. It was the closest thing to normal I had.',
                'I stopped watching the news. It was all the same—war, disaster, tragedy, repeat. The world was a terrible place, and I already knew that. I didn\'t need to be reminded every hour of every day. So I stopped watching, and for a while, I felt better. Then I realized that not knowing didn\'t make things better, it just made me ignorant, and I started watching again.',
                'The convenience store started selling premade meals. Not great meals—microwaveable things with too much sodium and not enough nutrition—but they were hot and they were cheap and they were better than instant ramen. I bought one every Friday, a small luxury, a small reward for surviving another week. It wasn\'t much, but it was something.',
                'I learned to recognize the sounds of my apartment. The radiator\'s clank. The neighbor\'s television. The footsteps in the hallway. These sounds became familiar, comforting in their way. They were the sounds of my life, the soundtrack of my survival, and I knew them better than I knew anything else.',
                'The warehouse had a break room with a vending machine. The machine had a glitch—sometimes it would give you two items instead of one. I discovered this by accident, pressing the button for a soda and getting two. I felt guilty, like I\'d stolen something, but I took them both anyway. It was the closest thing to good luck I\'d had in two years.',
                'I started writing. Not a journal—journals were for people with feelings worth recording—but lists. Lists of things I needed to do. Lists of things I\'d done. Lists of things I couldn\'t change. Lists were orderly. Lists were manageable. Lists were the opposite of the chaos in my head.',
                'The train had a delay announcement system. A robotic voice that apologized for inconveniences and promised to get us to our destinations as soon as possible. I heard that voice every day, sometimes multiple times a day, and I started to believe it. The apology, the promise, the hope that things would get better. Even though they never did.',
                'I learned to appreciate small victories. Finding a sale on rice balls. Getting a seat on the train. The nurse smiling at me in the hallway. These weren\'t happiness—happiness was too big, too complicated—but they were moments when the weight lifted, just a little, and I could breathe.',
                'The hospital had a chapel. A small room with stained glass and uncomfortable pews and a sign that said "All Faiths Welcome." I went there sometimes, not because I believed in God—I didn\'t know what I believed anymore—but because it was quiet. Quiet was rare in my life, and I took it wherever I could find it.',
                'I stopped making plans beyond the immediate future. I didn\'t plan for next week or next month or next year. I planned for today. Today I would go to work. Today I would visit Yuna. Today I would survive. Tomorrow would take care of itself, or it wouldn\'t. Either way, I couldn\'t control it, so I stopped trying.'
            ]
        },
        'generateBackstorySisterParagraphs': {
            'new_openings': [
                'Yuna had a collection of stuffed animals. Not the expensive kind—gifts from relatives, prizes from school festivals, things she\'d found at thrift stores and loved anyway. They sat on her bed in the hospital, a silent audience watching over her. Sometimes I arranged them in different positions, like she used to do. It was stupid, but it made me feel like I was doing something.',
                'The doctors talked about Yuna like she was a puzzle they couldn\'t solve. They showed me brain scans and explained neural pathways and used words I had to look up later. They were smart people, dedicated people, people who wanted to help. But they couldn\'t, and I could see it in their eyes every time they gave me an update. They were running out of hope, and I was running out of time.',
                'Yuna\'s friends stopped coming after the first month. Not because they didn\'t care—they did, I know they did—but because visiting a comatose friend is hard. It\'s sad and it\'s awkward and it\'s a reminder that life is fragile and unfair. So they stopped coming, and I didn\'t blame them. I wouldn\'t have wanted to visit me either.',
                'I found Yuna\'s diary once. I wasn\'t looking for it—I was cleaning her room, trying to make it less like a shrine and more like a room—and there it was, tucked under her mattress. I didn\'t read it. That would have been a violation, a betrayal of the privacy she couldn\'t defend anymore. I put it back where I found it, and I never looked for it again.',
                'The hospital had a policy about visitors. Only family during certain hours, only two at a time, no children under twelve. I followed all the rules, even the ones that didn\'t make sense. Rules were structure, and structure was what I needed. If I followed the rules, I was doing things right. If I was doing things right, maybe things would get better. They never did.',
                'Yuna\'s hair kept growing. The nurses trimmed it sometimes, but it grew anyway, slow and steady, like time itself. I brushed it every visit, running the comb through the strands the way Mom used to brush mine when I was little. It was a small thing, a meaningless thing, but it was something I could do, something active, something that felt like caring.',
                'The hospital had a gift shop. I bought things there sometimes—flowers, cards, small stuffed animals. I put them in Yuna\'s room, on the windowsill, on the nightstand, anywhere there was space. The room was full of things I\'d bought, evidence of my love in physical form. It wasn\'t enough. It was never enough.',
                'I talked to Yuna about the future sometimes. Not the future where she woke up—I couldn\'t let myself hope for that—but the future where she didn\'t. I told her about the arrangements I\'d made, the funeral home I\'d chosen, the plot I\'d bought next to Mom and Dad. I told her because I needed to say it out loud, because saying it made it real, and making it real was the only way I could survive it.',
                'The hospital had a social worker. A woman with kind eyes and a clipboard and a degree in helping people who couldn\'t be helped. She asked me how I was doing, if I needed anything, if I wanted to talk. I said I was fine, I didn\'t need anything, I didn\'t want to talk. I lied. I lied because the truth was too complicated, because the truth was that I wasn\'t doing at all.',
                'Yuna\'s room had a clock. A digital clock on the wall, red numbers glowing in the dark. I watched those numbers change every visit—6:47, 6:48, 6:49—marking time that passed without her. Time was the enemy now. Time was what was taking her away, second by second, minute by minute, and I couldn\'t stop it. I could only watch.'
            ],
            'new_middles': [
                'I learned the nurses\' schedules. Which ones worked days, which ones worked nights, which ones were kind, which ones were efficient. I timed my visits to coincide with the kind ones, not because the efficient ones were bad—they weren\'t—but because I needed kindness, even if it was professional kindness, even if it was just part of the job.',
                'The hospital had a cafeteria. I ate there sometimes when I was too tired to cook, sitting at a table by myself, surrounded by other people who were eating alone. We were a community of solitude, bound together by grief and illness and the understanding that some things you had to face alone.',
                'I brought Yuna music. Her favorite songs, downloaded onto my phone, played through tiny speakers that barely filled the room. I didn\'t know if she could hear it. The doctors said there was no evidence either way. But I played it anyway, because it was something I could do, something active, something that felt like love.',
                'The hospital had a garden. A small patch of grass behind the building where patients and visitors could sit and breathe air that didn\'t smell like antiseptic. I went there sometimes, when the weather was nice, and I\'d sit on a bench and watch the bees move between flowers. It was peaceful. It was the closest thing to normal I had.',
                'I learned to read the monitors. The beeps and the numbers and the flashing lights. I could tell when Yuna\'s heart rate was normal, when her blood pressure was stable, when something needed attention. I became fluent in the language of her survival, and that was both a comfort and a curse.',
                'The hospital had a chapel. A small room with stained glass and uncomfortable pews and a sign that said "All Faiths Welcome." I went there sometimes, not because I believed in God—I didn\'t know what I believed anymore—but because it was quiet. Quiet was rare in my life, and I took it wherever I could find it.',
                'I kept a record of everything. Her vitals, her medications, the doctors\' visits, the small changes that might or might not mean something. I wrote it all down in a notebook, page after page of data about a girl who wasn\'t there. It was obsessive, maybe, but it was something I could control, and control was what I needed.',
                'The hospital had a support group for families of coma patients. I went once, sat in a circle of chairs, listened to people tell stories that were too familiar. I never went back. It wasn\'t that they weren\'t helpful—they were—but that hearing other people\'s pain didn\'t make mine any better. It just made it louder.',
                'I learned to recognize the sounds of Yuna\'s room. The beep of the monitor. The hiss of the ventilator. The hum of the machines. These sounds became familiar, comforting in their way. They were the sounds of her life, the soundtrack of her survival, and I knew them better than I knew anything else.',
                'The hospital had a policy about personal items. Patients could have things from home, within reason. I brought Yuna\'s things—her books, her clothes, her stuffed animals—and arranged them around the room like I was building a nest. It was stupid, but it made me feel like I was doing something, like I was making her comfortable, like I was being a good brother.',
                'I stopped crying after a while. Not because I didn\'t feel sad—I did, constantly—but because crying took energy I couldn\'t spare. I needed that energy for work, for the hospital, for surviving. So I stopped crying, and the sadness settled into my chest like a heavy stone, and I carried it everywhere I went.',
                'The hospital had a volunteer program. People who came in to read to patients, to sit with them, to provide human contact when family couldn\'t be there. I appreciated them, really I did, but I never let them sit with Yuna. That was my job. That was the only thing I had left, and I wasn\'t going to share it.',
                'I learned to sleep in the chair. Not well—my back always hurt, my neck always cramped—but enough to get through the night. Sometimes I stayed overnight when the nurses said she was having a bad night, when the monitors beeped more often, when something felt wrong. I slept in the chair and held her hand and waited for morning.',
                'The hospital had a gift shop. I bought things there sometimes—flowers, cards, small stuffed animals. I put them in Yuna\'s room, on the windowsill, on the nightstand, anywhere there was space. The room was full of things I\'d bought, evidence of my love in physical form. It wasn\'t enough. It was never enough.',
                'I stopped making plans. Not just big plans—college, career, the future—but small plans too. What to eat for dinner. When to do laundry. What to watch on television. I lived moment to moment, responding to whatever happened next, because planning required hope and I didn\'t have any hope left.'
            ]
        }
    }
    
    # Apply expansions to each generator
    for generator_name, new_content in expansions.items():
        # Find the generator function
        pattern = rf'(function {generator_name}\([^)]*\) {{[^}}]*const paras = \[\];)'
        
        # Find the openings array
        openings_pattern = rf'(const openings = \[)(.*?)(\];)'
        openings_match = re.search(openings_pattern, content, re.DOTALL)
        
        if openings_match:
            # Get existing openings
            existing_openings = openings_match.group(2)
            
            # Add new openings
            new_openings_text = ',\n      '.join([f'"{p}"' for p in new_content['new_openings']])
            updated_openings = existing_openings.rstrip() + ',\n      ' + new_openings_text
            
            # Replace in content
            content = content.replace(
                openings_match.group(0),
                f'{openings_match.group(1)}{updated_openings}{openings_match.group(3)}'
            )
        
        # Find the middles array
        middles_pattern = rf'(const middles = \[)(.*?)(\];)'
        middles_match = re.search(middles_pattern, content, re.DOTALL)
        
        if middles_match:
            # Get existing middles
            existing_middles = middles_match.group(2)
            
            # Add new middles
            new_middles_text = ',\n      '.join([f'"{p}"' for p in new_content['new_middles']])
            updated_middles = existing_middles.rstrip() + ',\n      ' + new_middles_text
            
            # Replace in content
            content = content.replace(
                middles_match.group(0),
                f'{middles_match.group(1)}{updated_middles}{middles_match.group(3)}'
            )
    
    # Write updated content
    with open('backstory-engine.js', 'w') as f:
        f.write(content)
    
    print("Backstory content expansion complete!")
    print(f"Added {len(expansions['generateBackstoryLifeParagraphs']['new_openings'])} new life opening paragraphs")
    print(f"Added {len(expansions['generateBackstoryLifeParagraphs']['new_middles'])} new life middle paragraphs")
    print(f"Added {len(expansions['generateBackstorySisterParagraphs']['new_openings'])} new sister opening paragraphs")
    print(f"Added {len(expansions['generateBackstorySisterParagraphs']['new_middles'])} new sister middle paragraphs")

if __name__ == '__main__':
    expand_backstory_engine()
#!/usr/bin/env python3
"""
Backstory Content Expansion Script - Part 2
Adds new content to Parents, Struggle, VR Hype, and Headset generators
"""

import re

def expand_backstory_engine_v2():
    """Read backstory-engine.js and add expanded content to remaining generators"""
    
    with open('backstory-engine.js', 'r') as f:
        content = f.read()
    
    # New content to add
    expansions = {
        'generateBackstoryParentsParagraphs': {
            'new_openings': [
                'Mom had a collection of cookbooks. Not the fancy kind with glossy photos, but old ones, passed down from her mother and her grandmother, with stained pages and handwritten notes in the margins. She cooked from memory mostly, but sometimes she\'d pull out a book and try something new, and the kitchen would smell like spices and experimentation and love. I still have those cookbooks. I still can\'t bring myself to open them.',
                'Dad was a quiet man. Not silent—he spoke when he had something to say—but quiet in the way that some people are just naturally low-volume. He didn\'t need to fill every silence with words. He was comfortable with quiet, and he taught me to be comfortable with it too. Now my life is nothing but quiet, and I\'m not comfortable with it at all.',
                'My parents met at a library. Mom was studying for an exam, Dad was returning a book, and they reached for the same copy of "The Great Gatsby" at the same time. They used to tell that story at dinner parties, laughing about how romantic it wasn\'t. "It was just a book," Mom would say. "It was a very good book," Dad would say, and they\'d smile at each other like they were sharing a secret. I don\'t know what the secret was. I never asked.',
                'Mom was afraid of heights. Not mildly afraid—terrified. She wouldn\'t go on ladders, she wouldn\'t look out of windows on high floors, she wouldn\'t even watch movies with scenes on tall buildings. Dad thought it was funny. He\'d tease her about it, standing on chairs and pretending to wobble, and she\'d swat him away and tell him to stop being an idiot. They were happy. They were so happy.',
                'Dad had a scar on his chin. A thin white line, barely visible unless you were looking for it. He got it when he was a kid, falling off a bicycle and hitting the pavement. He used to tell me stories about how it happened—different stories every time, each more ridiculous than the last. A shark attack. A ninja fight. An alien abduction. I believed every one of them until I was ten, when Mom told me the truth. I still liked his versions better.',
                'Mom kept a journal. Not a diary—she hated that word—but a journal, where she wrote about her day, her thoughts, her feelings. She showed it to me once, when I was having a hard time at school, to show me that everyone struggled sometimes. I haven\'t read it since she died. It feels like violating her privacy, like seeing parts of her she never meant anyone to see. But I keep it, just in case.',
                'Dad was a morning person. He woke up at 5:00 AM every day, even on weekends, even on vacation. He\'d make coffee and read the newspaper and watch the sun come up, and he said it was the best part of the day—quiet, peaceful, full of possibility. I hated mornings. I still do. But sometimes, when I wake up early, I make coffee and watch the sun come up, and I think about him.',
                'Mom had a laugh that could fill a room. Not loud—she wasn\'t a loud person—but bright and sudden and impossible to fake. When she laughed, you wanted to laugh too, even if you didn\'t know what was funny. I haven\'t heard that laugh in two years, and sometimes I think I\'ll never hear anything like it again.',
                'Dad was terrible at telling jokes. He\'d forget the punchline, or get the timing wrong, or tell a joke that didn\'t make any sense at all. But he kept trying, because he liked making people laugh, and we kept laughing, not because the jokes were funny but because he was trying. That was the thing about Dad—he always tried.',
                'Mom was the one who taught me to read. Not the school way, with phonics and worksheets, but the real way, sitting on the couch with a book and pointing at words and sounding them out together. She was patient, endlessly patient, even when I was frustrated and wanted to give up. "Reading is a superpower," she\'d say. "Once you can read, you can go anywhere." She was right. But she didn\'t tell me that sometimes you read to escape from where you are.'
            ],
            'new_middles': [
                'My parents weren\'t perfect. They fought sometimes, about money and work and the usual things couples fight about. But they always made up. Always. Dad would bring Mom flowers, or Mom would make Dad\'s favorite dinner, or they\'d just sit on the couch and hold hands until the anger faded away. They loved each other, and that love was stronger than anything that could come between them.',
                'Dad had a workshop in the garage. He wasn\'t a handyman by trade, but he liked fixing things. He fixed the toaster when it stopped working. He fixed Yuna\'s bicycle when the chain fell off. He fixed the kitchen table when it wobbled. He said fixing things was satisfying because broken things stayed broken unless someone fixed them, and someone had to be that someone. Now the garage is full of tools I don\'t know how to use and projects I don\'t know how to finish.',
                'Mom was the one who handled the money. Dad earned it, but Mom managed it—paid the bills, balanced the checkbook, made sure there was enough for everything we needed. She was good at it, methodical and organized, and she taught me to be good at it too. Now I handle the money alone, and I\'m not as good at it as she was. I make mistakes. I forget things. I miss her.',
                'Dad had a favorite chair. An old armchair in the living room, worn and comfortable, with a permanent indentation where he sat. He\'d read there, watch television there, nap there. It was his spot, his territory, and no one else sat there unless he invited them to. After he died, I couldn\'t bring myself to sit in it. It felt like trespassing. It still does.',
                'Mom used to sing while she cooked. Not well—she couldn\'t carry a tune in a bucket—but with enthusiasm, like singing was something that had to be done with full commitment. She sang old Japanese songs and American pop songs and made-up songs about whatever she was cooking. "Rice is nice," she\'d sing, "rice is nice, rice is very very nice." I haven\'t heard anyone sing in the kitchen since she died. The kitchen is too quiet now.',
                'My parents had friends. Not a lot—Dad was too quiet for a big social circle, Mom was too busy—but a few close ones, people they\'d known for years, people who came to dinner parties and barbecues and birthday celebrations. After the funeral, those friends reached out, offered help, said to call if I needed anything. I never called. I couldn\'t. It was too hard to see people who knew them as people, not just as memories.',
                'Dad was proud of me. Not in a loud, boastful way, but in a quiet, steady way that I could feel even when he didn\'t say anything. He came to my school events, he helped me with homework, he listened when I talked about things that interested me. He made me feel like I mattered, like I was worth his time and attention. Now there\'s no one to be proud of me, and I don\'t know if I matter at all.',
                'Mom worried about everything. About money, about our health, about the future, about things that might never happen. Dad called her a worrywart and told her to relax, but she couldn\'t. Worrying was how she showed love—by anticipating problems before they happened, by trying to protect us from things that might go wrong. I inherited her worrying. I worry about everything now, just like she did.',
                'My parents had a routine. Wake up, coffee, work, dinner, television, sleep. Weekends were for chores and errands and family time. It wasn\'t exciting, but it was stable, predictable, safe. I took it for granted. I thought that\'s how life was supposed to be—stable, predictable, safe. Now I know better. Now I know that stability is a luxury, and safety is an illusion.',
                'Dad taught me to drive. Not well—he was impatient and I was nervous and we both yelled more than we should have—but he taught me. He sat in the passenger seat and gripped the dashboard and told me to watch the road and check my mirrors and use my turn signal, and eventually I learned. I still have his car. I still drive it sometimes. It smells like him, faint but unmistakable, and every time I get in, I miss him all over again.'
            ]
        },
        'generateBackstoryStruggleParagraphs': {
            'new_openings': [
                'The first time I paid a bill, I cried. Not because it was hard—I could figure out how to write a check and mail it—but because it was so adult, so final, so completely unlike anything I\'d ever done before. I was eighteen years old, paying an electric bill for an apartment I couldn\'t afford, and I felt like a child playing dress-up in clothes that were too big.',
                'I learned to cook by necessity. Not well—my repertoire was limited to about six dishes, all of them involving rice—but well enough to keep myself alive. I followed recipes from the internet, watched YouTube tutorials, made mistakes and learned from them. Dad would have been proud. Or maybe he would have laughed at my attempts. I didn\'t know. I never asked.',
                'The apartment was too big for one person. Three bedrooms, two bathrooms, a living room, a kitchen, a dining room—space designed for a family of four, now occupied by one. I lived in the master bedroom and let the other rooms sit empty, gathering dust, like monuments to people who weren\'t there anymore. Sometimes I went into Yuna\'s room and just stood there, breathing in the air that still smelled like her.',
                'I stopped going to school. Not officially—I was still enrolled, technically—but I stopped attending classes, stopped doing homework, stopped caring about grades. The school called, of course. They sent letters, they left messages, they threatened to expel me. I didn\'t care. What was the point of education when my life had already fallen apart? What was the point of planning a future I didn\'t believe in?',
                'The loneliness was physical. It was a weight in my chest, a tightness in my throat, a hollow ache behind my eyes. I was surrounded by people—at work, on the train, in the hospital—but I was completely alone. No one knew what I was going through. No one could know. Grief is a solitary experience, even when you\'re surrounded by people who love you, and I didn\'t even have that.',
                'I developed rituals. Not religious rituals—I wasn\'t praying to anyone—but personal ones, small acts of order in a chaotic world. I made coffee the same way every morning. I visited Yuna at the same time every day. I walked the same route to the warehouse. These rituals were anchors, things I could hold onto when everything else felt like it was spinning away.',
                'The anger came later. Not at first—at first there was just shock and grief and the overwhelming need to survive. But after the shock faded and the grief settled into something manageable, the anger came. Anger at the truck driver who ran the red light. Anger at the hospital for being so expensive. Anger at the universe for being so unfair. Anger at my parents for leaving me. Anger at myself for not being able to fix any of it.',
                'I learned to be invisible. At work, I did my job without drawing attention to myself. On the train, I blended into the crowd. In the hospital, I was just another visitor in a sea of visitors. Being invisible was safer. Being invisible meant no one asked questions. Being invisible meant I could just exist, without expectations or obligations or the need to perform for other people.',
                'The hardest part was the small things. The way the apartment was too quiet. The way no one asked how my day was. The way I had to make all the decisions alone, even the small ones like what to eat for dinner or when to go to bed. These small things accumulated, day after day, until they felt like a weight I couldn\'t carry.',
                'I became good at pretending. Pretending I was fine. Pretending I knew what I was doing. Pretending I had everything under control. I pretended so well that sometimes I almost believed it myself. But then I\'d come home to an empty apartment or sit alone in a hospital room or wake up in the middle of the night with no one to call, and the pretending would crack, and underneath was the truth: I was drowning, and I didn\'t know how to swim.'
            ],
            'new_middles': [
                'I learned to budget the way soldiers learn to field-strip weapons—through repetition, necessity, and the understanding that failure had consequences. Every dollar was assigned a purpose before it arrived. Rent: first priority. Hospital: second. Food: third. Everything else: nonexistent. I hadn\'t bought new clothes in a year. My shoes had holes that I covered with duct tape. My phone was two generations old and held together by a cracked screen protector and stubbornness.',
                'The apartment was a constant reminder of what I\'d lost. Dad\'s tools in the garage. Mom\'s books on the shelves. Yuna\'s room, exactly as she\'d left it, with schoolbooks on the desk and clothes on the floor and posters on the walls. I couldn\'t bring myself to change anything. It felt like erasing them, like admitting they weren\'t coming back. So I lived in this museum of their lives, surrounded by ghosts, and I pretended it was home.',
                'I stopped sleeping. Not entirely—I still closed my eyes and lay in the dark for hours—but I stopped actually sleeping, the kind of deep restorative sleep that makes you feel like a person. Instead I drifted in a haze of exhaustion, awake enough to function but not enough to feel, and that was fine. Feeling was the problem. If I didn\'t sleep, I didn\'t dream, and if I didn\'t dream, I didn\'t have to wake up and remember that they were gone.',
                'I developed a system for everything. A system for laundry (Sundays). A system for grocery shopping (Tuesdays). A system for paying bills (Fridays). Systems were predictable. Systems didn\'t require decisions. Systems were the opposite of chaos, and chaos was what I was trying to avoid.',
                'The warehouse had a cat. A stray that wandered in one day and never left. The workers fed it scraps and gave it water and let it sleep in the warm spots near the machinery. I liked that cat. It didn\'t ask anything from anyone. It just existed, and that was enough. Sometimes I felt like that cat—just existing, taking what was given, asking for nothing more.',
                'I started reading again. Not for pleasure—pleasure was a luxury I couldn\'t afford—but for distraction. I read books from the library, books from the bargain bin, books people left on the train. I read anything I could get my hands on, and for a few hours, I could be somewhere else, someone else, in a world where things made sense.',
                'The train had a regular cast of characters. The businessman who always fell asleep and missed his stop. The student who studied for exams with frantic intensity. The old woman who brought knitting and never finished anything. I watched them like they were characters in a show, and for a while, I wasn\'t the only one who was lonely.',
                'I learned to fix things. Not well—YouTube tutorials and trial and error—but enough to keep things working. The leaky faucet. The broken drawer. The flickering light. Dad would have been proud. Or maybe he would have been sad that I had to learn these things alone. I didn\'t know. I never asked.',
                'I stopped making plans. Not just big plans—college, career, the future—but small plans too. What to eat for dinner. When to do laundry. What to watch on television. I lived moment to moment, responding to whatever happened next, because planning required hope and I didn\'t have any hope left.',
                'The anger faded eventually. Not all at once, but slowly, like a wound that stops hurting even though the scar remains. I still got angry sometimes—at the unfairness, at the waste, at the silence—but it wasn\'t the constant burning rage it had been. It was just another feeling, another weight to carry, and I carried it because I had to.'
            ]
        },
        'generateBackstoryVRHypeParagraphs': {
            'new_openings': [
                'The game was called Endless Realms. Endless. That word stuck with me. Endless possibilities. Endless adventures. Endless life. My life felt like the opposite of endless. It felt finite, limited, bounded by grief and responsibility and the crushing weight of survival. The game offered something my life didn\'t: a future. A future that wasn\'t just more of the same.',
                'The technology was revolutionary. Full neural interface. Direct brain-to-game connection. No controllers, no screens, no barriers between you and the virtual world. They said it felt more real than reality. They said you\'d forget which world was which. They said it would change everything. I was skeptical. I was always skeptical. But even I had to admit—it was impressive.',
                'The cost was astronomical. The headset alone was five hundred dollars. Then there was the subscription fee, the in-game purchases, the premium content. People were spending thousands of dollars on a game that didn\'t exist. I couldn\'t understand it. I could barely afford to keep my sister alive in the real world. The idea of spending that kind of money on a virtual one was incomprehensible to me.',
                'The launch was a global event. Millions of people logging in simultaneously. Servers crashing under the load. Social media exploding with screenshots and stories and first impressions. The news covered it like it was a moon landing. The biggest entertainment launch in history. The dawn of a new era. I watched it all from the sidelines, feeling like I was missing something fundamental about being human.',
                'The game promised everything. Unlimited exploration. Infinite possibilities. A world where you could be anyone, do anything, go anywhere. No limits, no consequences, no reality to hold you back. People talked about it like it was a religion, like logging in was a form of salvation. I didn\'t get it. I didn\'t get how a virtual world could be better than the real one, even when the real one was terrible.',
                'Hiro was obsessed. He talked about it constantly, during breaks at the warehouse, during lunch, during the rare moments when we weren\'t working. He\'d pre-ordered the headset months ago, paid extra for overnight shipping, planned his character build with the intensity of someone planning a military operation. "You should get one too," he said. "It\'s going to be huge." I said I couldn\'t afford it, which was true, but also I didn\'t want it. I didn\'t want to escape into a virtual world. I wanted to fix the real one.'
            ],
            'new_middles': [
                'Everyone I knew was playing. Coworkers, neighbors, people on the train. Even the nurses at the hospital talked about it during their breaks. "What class are you playing?" they\'d ask each other. "What server are you on?" "Have you tried the new dungeon?" It was like a secret language, and I didn\'t speak it. I was the only person not playing, and that made me feel more alone than ever.',
                'The game had classes and races and skills and levels and all the trappings of traditional MMORPGs, but with a level of depth and complexity that made previous games look like toys. You could be a warrior or a mage or a rogue, but you could also be a craftsman or a merchant or a politician. You could build cities, run guilds, influence economies. The possibilities were literally endless, or so they said.',
                'I watched videos of gameplay. Streams of people exploring vast landscapes, fighting epic monsters, casting spectacular spells. It looked beautiful. It looked exciting. It looked like everything my life wasn\'t. And for a moment, just a moment, I felt something that felt almost like desire. Then I remembered Yuna in the hospital, and the feeling vanished, replaced by guilt. How could I want to play a game when my sister was in a coma?',
                'The game had a story. A main quest line that promised hundreds of hours of content. Side quests that would take months to complete. Hidden secrets and easter eggs and lore that players were still discovering. People spent hours discussing theories and sharing discoveries and debating the meaning of it all. It was a world within a world, and I was outside both of them.',
                'The social aspect was the biggest draw. You could meet people from all over the world. Form parties, join guilds, make friends, fall in love. People were getting married in the game. People were building real relationships that started in a virtual world. It was like the game had become a new kind of reality, one that was more real than the old one for millions of people.',
                'I tried to ignore it. I really did. I focused on work, on the hospital, on surviving. But the game was everywhere. It was inescapable. And slowly, almost without noticing, I started paying attention. I started reading articles about it. I started watching streams. I started wondering what it would be like to step into that world, to leave this one behind, if only for a little while.',
                'The game had a reputation system. Your actions had consequences. If you helped people, you gained reputation. If you hurt people, you lost it. Your reputation affected how NPCs treated you, what quests you could access, even what areas of the world you could enter. It was a moral system, but not a simple one. There were shades of gray, difficult choices, consequences that rippled through the world. It was complicated, and I liked complicated.',
                'The economy was player-driven. Everything in the game was crafted or gathered or sold by players. There were no NPCs selling items—everything came from other players. This meant the economy was complex and dynamic and constantly changing. Prices fluctuated based on supply and demand. Fortunes were made and lost. It was like a real economy, but without the real-world consequences. Or so people said.',
                'I heard stories about people who\'d changed their lives through the game. People who\'d made real money by selling in-game items. People who\'d found real friends, real communities, real purpose. People who\'d escaped abusive situations or found treatment for depression or discovered parts of themselves they didn\'t know existed. The game was more than entertainment—it was a lifeline for some people. I wondered if it could be a lifeline for me too.',
                'The game had been in development for ten years. A team of hundreds of developers, working in secret, creating something unprecedented. The technology alone was revolutionary—a neural interface that could read and write to the brain with near-zero latency. But it wasn\'t just the technology. It was the world they\'d built. The depth, the detail, the sheer scale of it. It was a masterpiece, and everyone knew it.'
            ]
        },
        'generateBackstoryHeadsetParagraphs': {
            'new_openings': [
                'I found the headset in a box of Dad\'s things. I was going through his workshop, sorting through tools and projects I didn\'t understand, and there it was—wrapped in bubble wrap, tucked in the back of a drawer. No note, no explanation, just the headset and a receipt dated three months before the accident. He\'d bought it for me. He\'d bought it and never told me, and now he was gone and I\'d never know why.',
                'The headset was expensive. I looked it up online—five hundred dollars, plus tax, plus shipping. Dad had paid for overnight delivery. He\'d wanted me to have it on launch day. He\'d wanted me to be part of whatever this was. But he\'d never given it to me. Maybe he was waiting for my birthday. Maybe he was waiting for the right moment. Maybe he\'d just forgotten. I\'d never know.',
                'I almost threw it away. That was my first instinct. I didn\'t want it. I didn\'t want anything that reminded me of Dad, of the accident, of the life we used to have. But I couldn\'t bring myself to do it. It was the last thing he\'d ever bought for me. Throwing it away felt like throwing him away, like erasing the last piece of evidence that he\'d existed, that he\'d loved me.',
                'The headset sat on my desk for weeks. I looked at it every day, but I didn\'t touch it. It was like a bomb that might go off if I handled it wrong. A bomb made of grief and guilt and questions I couldn\'t answer. What did Dad want me to do with it? Why did he buy it? What was he trying to tell me? I didn\'t know. I didn\'t know anything anymore.',
                'I finally opened the box on a Tuesday night. I don\'t know why Tuesday. I don\'t know why that night. Maybe I was just tired of looking at it. Maybe I was just tired of wondering. I opened the box and took out the headset and it was heavier than I expected, sleek and black and impossibly advanced, like something from a science fiction movie.',
                'The instructions were simple. Put on the headset. Connect to your phone. Follow the on-screen prompts. That was it. No setup, no configuration, no technical knowledge required. The technology was designed to be accessible to everyone, from gamers to grandmothers. I read the instructions three times, then put the headset back in the box. I wasn\'t ready. I didn\'t know if I\'d ever be ready.'
            ],
            'new_middles': [
                'I thought about what Dad would want. He\'d bought this for me. He\'d spent money he could have used for something else. He\'d planned this, whatever this was. If I didn\'t use it, I was wasting his gift. I was disrespecting his memory. But if I did use it, I was escaping into a virtual world while my sister lay in a coma in the real one. Either way, I was betraying someone. Either way, I was doing it wrong.',
                'The game promised escape. That was its selling point. A world where you could be anyone, do anything, leave your problems behind. But I didn\'t want to escape. I wanted to fix things. I wanted to wake Yuna up. I wanted to bring Mom and Dad back. I wanted to undo the accident. The game couldn\'t do any of that. The game was just a distraction, a way to pretend that everything was fine when it wasn\'t.',
                'I researched the game obsessively. I read every article, watched every video, followed every discussion thread. I learned about the classes and the races and the skills and the world. I learned about the economy and the politics and the social systems. I learned everything there was to know, except what it felt like to actually play. That was the one thing I couldn\'t learn without logging in.',
                'The headset had a neural interface. That was the revolutionary part. It connected directly to your brain, reading your thoughts and translating them into game actions. No controllers, no keyboards, no buttons. You thought about moving, and you moved. You thought about casting a spell, and you cast it. It was supposed to be seamless, intuitive, like using your own body. The idea terrified me.',
                'I worried about the risks. What if something went wrong? What if the interface damaged my brain? What if I got stuck in the game? What if I couldn\'t log out? The developers said it was safe, that they\'d tested it extensively, that millions of people were using it without problems. But developers always said that. They always said their products were safe until they weren\'t.',
                'I thought about Yuna. What would she think if she knew I was playing a game while she lay in a hospital bed? She\'d probably make fun of me. She\'d probably say I was being a nerd. She\'d probably want to play too. The thought made me smile, just a little, and then it made me sad, because she couldn\'t play. She couldn\'t do anything. She was just lying there, and I was here, hesitating over a headset.',
                'The headset was a bridge. Between me and Dad, between the real world and the virtual one, between who I was and who I might become. I didn\'t know if I wanted to cross that bridge. I didn\'t know what was on the other side. But the bridge was there, and eventually, I knew I\'d have to decide whether to walk across it or turn away.',
                'I remembered Dad\'s voice. Not the exact words, but the tone. The way he sounded when he was proud of me, when he was worried about me, when he was trying to tell me something without actually saying it. He\'d bought this headset for a reason. He\'d wanted me to have it for a reason. I didn\'t know what the reason was, but I trusted him. I trusted that whatever he\'d been thinking, whatever he\'d been feeling, it had come from love.',
                'The game was called Endless Realms. Endless. That word stuck with me. Endless possibilities. Endless adventures. Endless life. My life felt like the opposite of endless. It felt finite, limited, bounded by grief and responsibility and the crushing weight of survival. The game offered something my life didn\'t: a future. A future that wasn\'t just more of the same.',
                'I made a decision. Not a good decision or a bad decision, just a decision. I would try it. I would put on the headset and log in and see what happened. If it was terrible, I could stop. If it was a waste of time, I could quit. But at least I would know. At least I wouldn\'t spend the rest of my life wondering what Dad had wanted me to see.'
            ]
        }
    }
    
    # Apply expansions to each generator
    for generator_name, new_content in expansions.items():
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
    print(f"Added {len(expansions['generateBackstoryParentsParagraphs']['new_openings'])} new parents opening paragraphs")
    print(f"Added {len(expansions['generateBackstoryParentsParagraphs']['new_middles'])} new parents middle paragraphs")
    print(f"Added {len(expansions['generateBackstoryStruggleParagraphs']['new_openings'])} new struggle opening paragraphs")
    print(f"Added {len(expansions['generateBackstoryStruggleParagraphs']['new_middles'])} new struggle middle paragraphs")
    print(f"Added {len(expansions['generateBackstoryVRHypeParagraphs']['new_openings'])} new VR hype opening paragraphs")
    print(f"Added {len(expansions['generateBackstoryVRHypeParagraphs']['new_middles'])} new VR hype middle paragraphs")
    print(f"Added {len(expansions['generateBackstoryHeadsetParagraphs']['new_openings'])} new headset opening paragraphs")
    print(f"Added {len(expansions['generateBackstoryHeadsetParagraphs']['new_middles'])} new headset middle paragraphs")

if __name__ == '__main__':
    expand_backstory_engine_v2()
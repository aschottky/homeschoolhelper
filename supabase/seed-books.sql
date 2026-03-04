-- ─────────────────────────────────────────────────────────────────────────────
-- Seed suggested_books with curated read-aloud books
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → paste this file → Run
--
-- SAFE to run multiple times: only inserts if the table is currently empty.
-- If you want to re-seed (e.g. after clearing the table) just run again.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Only seed if table is empty
  IF (SELECT COUNT(*) FROM suggested_books) = 0 THEN

    INSERT INTO suggested_books (title, author, age_group, genre, description, sort_order) VALUES

    -- ── Toddlers (0–3) ──────────────────────────────────────────────────────
    ('Goodnight Moon',                               'Margaret Wise Brown',       'toddler',          'Bedtime',        'A classic bedtime story with soothing rhymes.',                                          10),
    ('The Very Hungry Caterpillar',                  'Eric Carle',                'toddler',          'Learning',       'Follow a caterpillar as he eats his way to becoming a butterfly.',                       20),
    ('Brown Bear, Brown Bear, What Do You See?',     'Bill Martin Jr.',           'toddler',          'Learning',       'Colorful animals and repetitive text perfect for little ones.',                          30),
    ('Pat the Bunny',                                'Dorothy Kunhardt',          'toddler',          'Interactive',    'A touch-and-feel classic for the youngest readers.',                                     40),
    ('Guess How Much I Love You',                    'Sam McBratney',             'toddler',          'Family',         'A heartwarming story about love between parent and child.',                               50),
    ('Dear Zoo',                                     'Rod Campbell',              'toddler',          'Interactive',    'Lift-the-flap fun as the zoo sends different pets.',                                     60),

    -- ── Preschool (3–5) ─────────────────────────────────────────────────────
    ('Where the Wild Things Are',                    'Maurice Sendak',            'preschool',        'Fantasy',        'Max sails to where the wild things are in this imaginative tale.',                       10),
    ('Chicka Chicka Boom Boom',                      'Bill Martin Jr.',           'preschool',        'Learning',       'A rhythmic alphabet adventure up the coconut tree.',                                     20),
    ('The Gruffalo',                                 'Julia Donaldson',           'preschool',        'Fantasy',        'A clever mouse outsmarts predators with an imaginary creature.',                         30),
    ('Corduroy',                                     'Don Freeman',               'preschool',        'Friendship',     'A teddy bear searches for his missing button.',                                          40),
    ('Curious George',                               'H.A. Rey',                  'preschool',        'Adventure',      'A curious monkey gets into all kinds of mischief.',                                      50),
    ('If You Give a Mouse a Cookie',                 'Laura Numeroff',            'preschool',        'Humor',          'A circular tale of cause and effect.',                                                   60),
    ('The Rainbow Fish',                             'Marcus Pfister',            'preschool',        'Friendship',     'A beautiful fish learns the joy of sharing.',                                            70),
    ('Knuffle Bunny',                                'Mo Willems',                'preschool',        'Family',         'A toddler loses her beloved stuffed bunny.',                                             80),

    -- ── Early Elementary (5–7) ──────────────────────────────────────────────
    ('Frog and Toad Are Friends',                    'Arnold Lobel',              'early-elementary', 'Friendship',     'Five stories about two best friends.',                                                   10),
    ('Amelia Bedelia',                               'Peggy Parish',              'early-elementary', 'Humor',          'A literal-minded housekeeper creates hilarious chaos.',                                  20),
    ('Magic Tree House: Dinosaurs Before Dark',      'Mary Pope Osborne',         'early-elementary', 'Adventure',      'Jack and Annie travel through time.',                                                    30),
    ('Junie B. Jones and the Stupid Smelly Bus',     'Barbara Park',              'early-elementary', 'Humor',          'A spunky kindergartner navigates school.',                                               40),
    ('Mercy Watson to the Rescue',                   'Kate DiCamillo',            'early-elementary', 'Humor',          'A toast-loving pig saves the day.',                                                      50),
    ('Elephant & Piggie: There Is a Bird on Your Head!', 'Mo Willems',           'early-elementary', 'Humor',          'Simple, hilarious stories of friendship.',                                               60),
    ('Owl at Home',                                  'Arnold Lobel',              'early-elementary', 'Fantasy',        'Five gentle stories about a kind owl.',                                                  70),
    ('Dragons Love Tacos',                           'Adam Rubin',                'early-elementary', 'Humor',          'Dragons really, really love tacos (but not salsa!).',                                   80),

    -- ── Elementary (7–9) ────────────────────────────────────────────────────
    ('Charlotte''s Web',                             'E.B. White',                'elementary',       'Classic',        'A spider saves her pig friend through the power of words.',                              10),
    ('The BFG',                                      'Roald Dahl',                'elementary',       'Fantasy',        'A big friendly giant and a little girl capture dreams.',                                 20),
    ('Stuart Little',                                'E.B. White',                'elementary',       'Adventure',      'A mouse born to a human family goes on adventures.',                                    30),
    ('The Boxcar Children',                          'Gertrude Chandler Warner',  'elementary',       'Mystery',        'Four orphans make a home in an abandoned boxcar.',                                       40),
    ('Ramona Quimby, Age 8',                         'Beverly Cleary',            'elementary',       'Realistic',      'Third-grader Ramona faces everyday challenges.',                                         50),
    ('James and the Giant Peach',                    'Roald Dahl',                'elementary',       'Fantasy',        'A boy escapes in a magical giant peach.',                                                60),
    ('Mr. Popper''s Penguins',                       'Richard Atwater',           'elementary',       'Humor',          'A house painter receives a penguin from Antarctica.',                                    70),
    ('Fantastic Mr. Fox',                            'Roald Dahl',                'elementary',       'Adventure',      'A clever fox outwits three mean farmers.',                                               80),
    ('The Cricket in Times Square',                  'George Selden',             'elementary',       'Fantasy',        'A musical cricket finds friendship in New York.',                                        90),

    -- ── Upper Elementary (9–11) ─────────────────────────────────────────────
    ('Harry Potter and the Sorcerer''s Stone',       'J.K. Rowling',              'upper-elementary', 'Fantasy',        'A boy discovers he is a wizard.',                                                        10),
    ('The Lion, the Witch and the Wardrobe',         'C.S. Lewis',                'upper-elementary', 'Fantasy',        'Four children enter a magical land through a wardrobe.',                                 20),
    ('Hatchet',                                      'Gary Paulsen',              'upper-elementary', 'Survival',       'A boy survives alone in the Canadian wilderness.',                                       30),
    ('Holes',                                        'Louis Sachar',              'upper-elementary', 'Adventure',      'A boy is sent to a correctional camp to dig holes.',                                     40),
    ('Percy Jackson: The Lightning Thief',           'Rick Riordan',              'upper-elementary', 'Fantasy',        'A boy discovers he is the son of a Greek god.',                                          50),
    ('A Wrinkle in Time',                            'Madeleine L''Engle',        'upper-elementary', 'Science Fiction','Meg travels through space and time to rescue her father.',                               60),
    ('Tuck Everlasting',                             'Natalie Babbitt',           'upper-elementary', 'Fantasy',        'A girl discovers a family that lives forever.',                                          70),
    ('Island of the Blue Dolphins',                  'Scott O''Dell',             'upper-elementary', 'Survival',       'A girl survives alone on an island for years.',                                          80),
    ('The Phantom Tollbooth',                        'Norton Juster',             'upper-elementary', 'Fantasy',        'A bored boy journeys through the Lands Beyond.',                                         90),
    ('The Secret Garden',                            'Frances Hodgson Burnett',   'upper-elementary', 'Classic',        'An orphan discovers a hidden garden and finds healing.',                                100),

    -- ── Middle School (11–14) ───────────────────────────────────────────────
    ('The Hobbit',                                   'J.R.R. Tolkien',            'middle-school',    'Fantasy',        'A hobbit embarks on an unexpected adventure.',                                           10),
    ('The Outsiders',                                'S.E. Hinton',               'middle-school',    'Realistic',      'A classic story of teenage rivalry and loyalty.',                                        20),
    ('The Giver',                                    'Lois Lowry',                'middle-school',    'Dystopian',      'A boy discovers the dark truth about his utopian society.',                              30),
    ('Roll of Thunder, Hear My Cry',                 'Mildred D. Taylor',         'middle-school',    'Historical',     'A Black family fights for their land in 1930s Mississippi.',                             40),
    ('The Diary of Anne Frank',                      'Anne Frank',                'middle-school',    'Memoir',         'A Jewish girl documents hiding during the Holocaust.',                                   50),
    ('Number the Stars',                             'Lois Lowry',                'middle-school',    'Historical',     'A Danish girl helps her Jewish friend escape the Nazis.',                                60),
    ('The Hunger Games',                             'Suzanne Collins',           'middle-school',    'Dystopian',      'A girl volunteers to fight to the death in a televised competition.',                    70),
    ('Wonder',                                       'R.J. Palacio',              'middle-school',    'Realistic',      'A boy with facial differences starts public school.',                                    80),
    ('Treasure Island',                              'Robert Louis Stevenson',    'middle-school',    'Adventure',      'A boy joins pirates searching for buried treasure.',                                     90),
    ('The Call of the Wild',                         'Jack London',               'middle-school',    'Adventure',      'A dog discovers his wild nature in the Yukon.',                                         100);

    RAISE NOTICE 'Seeded 52 suggested books successfully.';
  ELSE
    RAISE NOTICE 'suggested_books table already has data — skipping seed. Delete rows first to re-seed.';
  END IF;
END $$;

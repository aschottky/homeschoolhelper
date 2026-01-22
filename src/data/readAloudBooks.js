// Suggested Read-Aloud Books by Age Group
// Classic and beloved books perfect for reading aloud to children

export const AGE_GROUPS = [
  { id: 'toddler', name: 'Toddlers', ages: '0-3', description: 'Board books and simple picture books' },
  { id: 'preschool', name: 'Preschool', ages: '3-5', description: 'Picture books with engaging stories' },
  { id: 'early-elementary', name: 'Early Elementary', ages: '5-7', description: 'Longer picture books and early chapter books' },
  { id: 'elementary', name: 'Elementary', ages: '7-9', description: 'Chapter books and classic tales' },
  { id: 'upper-elementary', name: 'Upper Elementary', ages: '9-11', description: 'Middle grade novels and adventures' },
  { id: 'middle-school', name: 'Middle School', ages: '11-14', description: 'Young adult and classic literature' },
]

export const SUGGESTED_BOOKS = [
  // Toddlers (0-3)
  { id: 'goodnight-moon', title: 'Goodnight Moon', author: 'Margaret Wise Brown', ageGroup: 'toddler', genre: 'Bedtime', description: 'A classic bedtime story with soothing rhymes.' },
  { id: 'very-hungry-caterpillar', title: 'The Very Hungry Caterpillar', author: 'Eric Carle', ageGroup: 'toddler', genre: 'Learning', description: 'Follow a caterpillar as he eats his way to becoming a butterfly.' },
  { id: 'brown-bear', title: 'Brown Bear, Brown Bear, What Do You See?', author: 'Bill Martin Jr.', ageGroup: 'toddler', genre: 'Learning', description: 'Colorful animals and repetitive text perfect for little ones.' },
  { id: 'pat-the-bunny', title: 'Pat the Bunny', author: 'Dorothy Kunhardt', ageGroup: 'toddler', genre: 'Interactive', description: 'A touch-and-feel classic for the youngest readers.' },
  { id: 'guess-how-much', title: 'Guess How Much I Love You', author: 'Sam McBratney', ageGroup: 'toddler', genre: 'Family', description: 'A heartwarming story about love between parent and child.' },
  { id: 'dear-zoo', title: 'Dear Zoo', author: 'Rod Campbell', ageGroup: 'toddler', genre: 'Interactive', description: 'Lift-the-flap fun as the zoo sends different pets.' },

  // Preschool (3-5)
  { id: 'where-wild-things', title: 'Where the Wild Things Are', author: 'Maurice Sendak', ageGroup: 'preschool', genre: 'Fantasy', description: 'Max sails to where the wild things are in this imaginative tale.' },
  { id: 'chicka-chicka', title: 'Chicka Chicka Boom Boom', author: 'Bill Martin Jr.', ageGroup: 'preschool', genre: 'Learning', description: 'A rhythmic alphabet adventure up the coconut tree.' },
  { id: 'gruffalo', title: 'The Gruffalo', author: 'Julia Donaldson', ageGroup: 'preschool', genre: 'Fantasy', description: 'A clever mouse outsmarts predators with an imaginary creature.' },
  { id: 'corduroy', title: 'Corduroy', author: 'Don Freeman', ageGroup: 'preschool', genre: 'Friendship', description: 'A teddy bear searches for his missing button.' },
  { id: 'curious-george', title: 'Curious George', author: 'H.A. Rey', ageGroup: 'preschool', genre: 'Adventure', description: 'A curious monkey gets into all kinds of mischief.' },
  { id: 'if-you-give-mouse', title: 'If You Give a Mouse a Cookie', author: 'Laura Numeroff', ageGroup: 'preschool', genre: 'Humor', description: 'A circular tale of cause and effect.' },
  { id: 'rainbow-fish', title: 'The Rainbow Fish', author: 'Marcus Pfister', ageGroup: 'preschool', genre: 'Friendship', description: 'A beautiful fish learns the joy of sharing.' },
  { id: 'knuffle-bunny', title: 'Knuffle Bunny', author: 'Mo Willems', ageGroup: 'preschool', genre: 'Family', description: 'A toddler loses her beloved stuffed bunny.' },

  // Early Elementary (5-7)
  { id: 'frog-toad', title: 'Frog and Toad Are Friends', author: 'Arnold Lobel', ageGroup: 'early-elementary', genre: 'Friendship', description: 'Five stories about two best friends.' },
  { id: 'amelia-bedelia', title: 'Amelia Bedelia', author: 'Peggy Parish', ageGroup: 'early-elementary', genre: 'Humor', description: 'A literal-minded housekeeper creates hilarious chaos.' },
  { id: 'magic-tree-house', title: 'Magic Tree House: Dinosaurs Before Dark', author: 'Mary Pope Osborne', ageGroup: 'early-elementary', genre: 'Adventure', description: 'Jack and Annie travel through time.' },
  { id: 'junie-b-jones', title: 'Junie B. Jones and the Stupid Smelly Bus', author: 'Barbara Park', ageGroup: 'early-elementary', genre: 'Humor', description: 'A spunky kindergartner navigates school.' },
  { id: 'mercy-watson', title: 'Mercy Watson to the Rescue', author: 'Kate DiCamillo', ageGroup: 'early-elementary', genre: 'Humor', description: 'A toast-loving pig saves the day.' },
  { id: 'elephant-piggie', title: 'Elephant & Piggie: There Is a Bird on Your Head!', author: 'Mo Willems', ageGroup: 'early-elementary', genre: 'Humor', description: 'Simple, hilarious stories of friendship.' },
  { id: 'owl-at-home', title: 'Owl at Home', author: 'Arnold Lobel', ageGroup: 'early-elementary', genre: 'Fantasy', description: 'Five gentle stories about a kind owl.' },
  { id: 'dragons-love-tacos', title: 'Dragons Love Tacos', author: 'Adam Rubin', ageGroup: 'early-elementary', genre: 'Humor', description: 'Dragons really, really love tacos (but not salsa!).' },

  // Elementary (7-9)
  { id: 'charlottes-web', title: "Charlotte's Web", author: 'E.B. White', ageGroup: 'elementary', genre: 'Classic', description: 'A spider saves her pig friend through the power of words.' },
  { id: 'bfg', title: 'The BFG', author: 'Roald Dahl', ageGroup: 'elementary', genre: 'Fantasy', description: 'A big friendly giant and a little girl capture dreams.' },
  { id: 'stuart-little', title: 'Stuart Little', author: 'E.B. White', ageGroup: 'elementary', genre: 'Adventure', description: 'A mouse born to a human family goes on adventures.' },
  { id: 'boxcar-children', title: 'The Boxcar Children', author: 'Gertrude Chandler Warner', ageGroup: 'elementary', genre: 'Mystery', description: 'Four orphans make a home in an abandoned boxcar.' },
  { id: 'ramona', title: 'Ramona Quimby, Age 8', author: 'Beverly Cleary', ageGroup: 'elementary', genre: 'Realistic', description: 'Third-grader Ramona faces everyday challenges.' },
  { id: 'james-peach', title: 'James and the Giant Peach', author: 'Roald Dahl', ageGroup: 'elementary', genre: 'Fantasy', description: 'A boy escapes in a magical giant peach.' },
  { id: 'mr-popper', title: "Mr. Popper's Penguins", author: 'Richard Atwater', ageGroup: 'elementary', genre: 'Humor', description: 'A house painter receives a penguin from Antarctica.' },
  { id: 'fantastic-mr-fox', title: 'Fantastic Mr. Fox', author: 'Roald Dahl', ageGroup: 'elementary', genre: 'Adventure', description: 'A clever fox outwits three mean farmers.' },
  { id: 'cricket-times-square', title: 'The Cricket in Times Square', author: 'George Selden', ageGroup: 'elementary', genre: 'Fantasy', description: 'A musical cricket finds friendship in New York.' },

  // Upper Elementary (9-11)
  { id: 'harry-potter', title: "Harry Potter and the Sorcerer's Stone", author: 'J.K. Rowling', ageGroup: 'upper-elementary', genre: 'Fantasy', description: 'A boy discovers he is a wizard.' },
  { id: 'narnia-lion', title: 'The Lion, the Witch and the Wardrobe', author: 'C.S. Lewis', ageGroup: 'upper-elementary', genre: 'Fantasy', description: 'Four children enter a magical land through a wardrobe.' },
  { id: 'hatchet', title: 'Hatchet', author: 'Gary Paulsen', ageGroup: 'upper-elementary', genre: 'Survival', description: 'A boy survives alone in the Canadian wilderness.' },
  { id: 'holes', title: 'Holes', author: 'Louis Sachar', ageGroup: 'upper-elementary', genre: 'Adventure', description: 'A boy is sent to a correctional camp to dig holes.' },
  { id: 'percy-jackson', title: 'Percy Jackson: The Lightning Thief', author: 'Rick Riordan', ageGroup: 'upper-elementary', genre: 'Fantasy', description: 'A boy discovers he is the son of a Greek god.' },
  { id: 'wrinkle-time', title: 'A Wrinkle in Time', author: "Madeleine L'Engle", ageGroup: 'upper-elementary', genre: 'Science Fiction', description: 'Meg travels through space and time to rescue her father.' },
  { id: 'tuck-everlasting', title: 'Tuck Everlasting', author: 'Natalie Babbitt', ageGroup: 'upper-elementary', genre: 'Fantasy', description: 'A girl discovers a family that lives forever.' },
  { id: 'island-dolphins', title: 'Island of the Blue Dolphins', author: "Scott O'Dell", ageGroup: 'upper-elementary', genre: 'Survival', description: 'A girl survives alone on an island for years.' },
  { id: 'phantom-tollbooth', title: 'The Phantom Tollbooth', author: 'Norton Juster', ageGroup: 'upper-elementary', genre: 'Fantasy', description: 'A bored boy journeys through the Lands Beyond.' },
  { id: 'secret-garden', title: 'The Secret Garden', author: 'Frances Hodgson Burnett', ageGroup: 'upper-elementary', genre: 'Classic', description: 'An orphan discovers a hidden garden and finds healing.' },

  // Middle School (11-14)
  { id: 'hobbit', title: 'The Hobbit', author: 'J.R.R. Tolkien', ageGroup: 'middle-school', genre: 'Fantasy', description: 'A hobbit embarks on an unexpected adventure.' },
  { id: 'outsiders', title: 'The Outsiders', author: 'S.E. Hinton', ageGroup: 'middle-school', genre: 'Realistic', description: 'A classic story of teenage rivalry and loyalty.' },
  { id: 'giver', title: 'The Giver', author: 'Lois Lowry', ageGroup: 'middle-school', genre: 'Dystopian', description: 'A boy discovers the dark truth about his utopian society.' },
  { id: 'roll-thunder', title: 'Roll of Thunder, Hear My Cry', author: 'Mildred D. Taylor', ageGroup: 'middle-school', genre: 'Historical', description: 'A Black family fights for their land in 1930s Mississippi.' },
  { id: 'anne-frank', title: 'The Diary of Anne Frank', author: 'Anne Frank', ageGroup: 'middle-school', genre: 'Memoir', description: 'A Jewish girl documents hiding during the Holocaust.' },
  { id: 'number-stars', title: 'Number the Stars', author: 'Lois Lowry', ageGroup: 'middle-school', genre: 'Historical', description: 'A Danish girl helps her Jewish friend escape the Nazis.' },
  { id: 'hunger-games', title: 'The Hunger Games', author: 'Suzanne Collins', ageGroup: 'middle-school', genre: 'Dystopian', description: 'A girl volunteers to fight to the death in a televised competition.' },
  { id: 'wonder', title: 'Wonder', author: 'R.J. Palacio', ageGroup: 'middle-school', genre: 'Realistic', description: 'A boy with facial differences starts public school.' },
  { id: 'treasure-island', title: 'Treasure Island', author: 'Robert Louis Stevenson', ageGroup: 'middle-school', genre: 'Adventure', description: 'A boy joins pirates searching for buried treasure.' },
  { id: 'call-wild', title: 'The Call of the Wild', author: 'Jack London', ageGroup: 'middle-school', genre: 'Adventure', description: 'A dog discovers his wild nature in the Yukon.' },
]

// Get books by age group
export const getBooksByAgeGroup = (ageGroupId) => {
  return SUGGESTED_BOOKS.filter(book => book.ageGroup === ageGroupId)
}

// Get all genres
export const GENRES = [...new Set(SUGGESTED_BOOKS.map(book => book.genre))].sort()

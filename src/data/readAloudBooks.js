// Suggested Read-Aloud Books by Age Group
// Groups match the curated Excel reading list tabs

export const AGE_GROUPS = [
  { id: 'ages-0-3',    name: 'Ages 0–3',  ages: '0-3',  description: 'Board books and simple picture books' },
  { id: 'ages-4-7',   name: 'Ages 4–7',  ages: '4-7',  description: 'Picture books and early chapter books' },
  { id: 'ages-8-12',  name: 'Ages 8–12', ages: '8-12', description: 'Chapter books and classic literature' },
  { id: 'ages-13-plus', name: 'Ages 13+', ages: '13+', description: 'Young adult and classic literature' },
]

// Static fallback list is empty — all books are loaded from the database.
export const SUGGESTED_BOOKS = []

// Get books by age group
export const getBooksByAgeGroup = (ageGroupId) => {
  return SUGGESTED_BOOKS.filter(book => book.ageGroup === ageGroupId)
}

// Get all genres
export const GENRES = [...new Set(SUGGESTED_BOOKS.map(book => book.genre))].sort()

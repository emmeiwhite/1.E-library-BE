export type User = {
  _id: string
  name: string
  email: string
  password: string
}

export type Book = {
  _id: string
  title: string
  author: User
  genre: string
  coverImage: string
  file: string
  createAt: Date
  updatedAt: Date
}

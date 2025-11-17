import express, { Request, Response } from 'express';
import { Book, IBook } from '../models/Book';

const router = express.Router();

// Get all books
router.get('/books', async (req: Request, res: Response) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error });
  }
});

// Get statistics
router.get('/books/stats', async (req: Request, res: Response) => {
  try {
    const books = await Book.find();
    const totalBooksRead = books.filter(book => book.finished).length;
    const totalPages = books.reduce((sum, book) => sum + book.pagesRead, 0);
    
    res.json({
      totalBooksRead,
      totalPages,
      totalBooks: books.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error });
  }
});

// Create a new book
router.post('/books', async (req: Request, res: Response) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: 'Error creating book', error });
  }
});

// Update a book
router.put('/books/:id', async (req: Request, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    Object.assign(book, req.body);
    await book.save();
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: 'Error updating book', error });
  }
});

// Delete a book
router.delete('/books/:id', async (req: Request, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    await book.deleteBook();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book', error });
  }
});

export default router;
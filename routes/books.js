import { Router } from 'express';
import {
  createBook,
  getAllBooks,
  rentTheBook,
  returnTheBook,
  getAllRentedBooks,
  getAllUserRents,
} from '../controllers/books.js';

const router = new Router();

//CreateBook
//http://localhost:3002/api/books
router.post('/', createBook);

//GetAllBookss
//http://localhost:3002/api/books
router.get('/', getAllBooks);

//Rent Book
//http://localhost:3002/api/books/rent/bookId/userId
router.put('/rent/:bookId/:userId', rentTheBook);

//Return Book
//http://localhost:3002/api/books/return/bookId/userId
router.put('/return/:bookId/:userId', returnTheBook);

//GetAllRentedBooks
//http://localhost:3002/api/books/rent
router.get('/rent', getAllRentedBooks);

//Users rent history of specific book
//http://localhost:3002/api/books/id/rent
router.get('/:id/rent', getAllUserRents);

export default router;

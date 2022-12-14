import Book from '../models/Book.js';
import User from '../models/User.js';

//Create Book
export const createBook = async (req, res) => {
  try {
    const { titel, author, publishYear } = req.body;
    const newBook = new Book({
      titel,
      author,
      publishYear,
    });
    await newBook.save();
    return res.json({ newBook });
  } catch (error) {
    res.json({ message: 'Something went wrong' });
  }
};

//getAllBooks
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort('-cretedAt');

    if (!books) {
      return res.json({ message: 'There are no Books' });
    }
    return res.json({ books });
  } catch (error) {
    res.json({ message: 'Something went wrong!' });
  }
};

//Rent The Book
export const rentTheBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const userId = req.params.userId;

    const book = await Book.findById(bookId);
    const user = await User.findById(userId);

    if (!book.isAvailable) {
      return res.json({ message: 'The book is not available!' });
    }

    //12096e5 = 2 weeks in milliseconds
    const rentBook = {
      userId: userId,
      firstname: user.firstname,
      email: user.email,
      address: user.address,
      startRentDate: Date.now(),
      expectedEndRentDate: Date.now() + 12096e5,
      actualEndRentDate: null,
    };

    const updatedBook = await Book.findByIdAndUpdate(bookId, {
      isAvailable: false,
      startRentDate: Date.now(),
      expectedEndRentDate: Date.now() + 12096e5,
      actualEndRentDate: null,
      $push: { rents: rentBook },
    });

    const rentUser = {
      bookId: bookId,
      bookTitle: book.titel,
      bookAuthor: book.author,
      bookPublishYear: book.publishYear,
      startRentDate: Date.now(),
      expectedEndRentDate: Date.now() + 12096e5,
      actualEndRentDate: null,
    };

    const updatedUser = await User.findByIdAndUpdate(userId, {
      $push: { rents: rentUser },
    });

    return res.json({ updatedBook, updatedUser });
  } catch (error) {
    res.json({ message: 'Something went wrong!' });
  }
};

//Renturn The Book
export const returnTheBook = async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookId = req.params.bookId;

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);

    if (book.isAvailable) {
      return res.json({
        message: 'You can not return this book. This book is available!',
      });
    }

    book.isAvailable = true;
    const now = Date.now();
    book.actualEndRentDate = now;
    book.rents[book.rents.length - 1].actualEndRentDate = now;

    let rentToRelease = user.rents.filter(
      (r) => !r.actualEndRentDate && r.bookId === bookId
    );

    if (rentToRelease.length > 1) {
      throw new Error("There can't be more than one active rent for the book");
    }

    rentToRelease[0].actualEndRentDate = now;

    await book.save();
    await user.save();

    return res.json({ book });
  } catch (error) {
    res.json({ message: 'Something went wrong!' });
  }
};

//getAllRentedBooks
export const getAllRentedBooks = async (req, res) => {
  try {
    const books = await Book.find({ isAvailable: false });

    if (!books || books.length < 1) {
      return res.json({ message: 'There are no rented books' });
    }
    return res.json({ books });
  } catch (error) {
    res.json({ message: 'Something went wrong!' });
  }
};

//getAllUserRents
export const getAllUserRents = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.json({ message: 'There is no book!' });
    }

    return res.json(book.rents);
  } catch (error) {
    res.json({ message: 'Something went wrong!' });
  }
};

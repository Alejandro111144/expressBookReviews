const express = require('express');
let books = require("./booksdb.js"); // Import the books data
let isValid = require("./auth_users.js").isValid; // Authentication logic (if needed)
let users = require("./auth_users.js").users; // User data (if needed)
const public_users = express.Router();

// Register route (not implemented yet)
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;  // Extract the username and password from the request body
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Check if the username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists. Please choose another one." });
    }
  
    // If no issues, add the new user to the users list
    users.push({ username, password });
  
    return res.status(201).json({ message: "User registered successfully!" });
  });
  
  
// Get the list of books available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);  // Return books data as JSON
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Iterate through the books and find the book with the matching ISBN
  const book = Object.values(books).find(b => b.isbn === isbn);

  if (book) {
    return res.status(200).json(book);  // Return book details if found
  } else {
    return res.status(404).json({ message: "Book not found with this ISBN" });  // Handle book not found
  }
});

// Get book details based on author
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();  // Get the author from request and convert to lowercase for case-insensitive comparison
    const booksByAuthor = [];
  
    // Get all the keys of the books object (the numeric keys)
    const bookKeys = Object.keys(books);
  
    // Iterate through the books and check if the author matches
    bookKeys.forEach(key => {
      const book = books[key];
  
      if (book.author.toLowerCase() === author) {
        booksByAuthor.push(book);  // If match, add the book to the result array
      }
    });
  
    // If books by the author are found, return them; otherwise, send a 404 message
    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  });
  

// Get all books based on title
// Get book details based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();  // Get the title from request and convert to lowercase for case-insensitive comparison
    const booksByTitle = [];
  
    // Get all the keys of the books object (the numeric keys)
    const bookKeys = Object.keys(books);
  
    // Iterate through the books and check if the title matches
    bookKeys.forEach(key => {
      const book = books[key];
  
      if (book.title.toLowerCase().includes(title)) {  // Use .includes() for partial match
        booksByTitle.push(book);  // If match, add the book to the result array
      }
    });
  
    // If books by the title are found, return them; otherwise, send a 404 message
    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  });
  

// Get book review based on ISBN
// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;  // Get the ISBN from request parameters
  
    // Find the book by ISBN
    const book = Object.values(books).find(b => b.isbn === isbn);  // Use Object.values(books) to iterate over the books
  
    // If the book exists and has reviews, return the reviews
    if (book && book.reviews && Object.keys(book.reviews).length > 0) {
      return res.status(200).json(book.reviews);
    } else {
      // If no book is found or no reviews are available
      return res.status(404).json({ message: "Reviews not found for this book" });
    }
  });
  

module.exports.general = public_users;

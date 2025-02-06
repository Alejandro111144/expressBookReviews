const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js"); // Import the books data
let isValid = require("./auth_users.js").isValid; // Authentication logic (if needed)
let users = require("./auth_users.js").users; // User data (if needed)
const public_users = express.Router();

// Register route (not implemented yet)
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists. Please choose another one." });
    }

    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully!" });
});

// Get the list of books available in the shop (Synchronous)
public_users.get('/', function (req, res) {
    return res.status(200).json(books);
});

// Get the list of books using async/await with Axios (Task 10)
public_users.get('/async-books', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get the list of books using Promise callbacks (Task 10 alternative)
public_users.get('/promise-books', function (req, res) {
    axios.get('http://localhost:5000/')
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching books", error: error.message });
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = Object.values(books).find(b => b.isbn === isbn);

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found with this ISBN" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author);

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get book details based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title));

    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = Object.values(books).find(b => b.isbn === isbn);

    if (book && book.reviews && Object.keys(book.reviews).length > 0) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Reviews not found for this book" });
    }
});

module.exports.general = public_users;

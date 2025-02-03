const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Your books data
const regd_users = express.Router();
const secretKey = 'yourSecretKey'; // Store in an environment variable in production
const users = [];

// Function to check if username is valid
const isValid = (username) => {
  return users.some(user => user.username === username); // Check if username exists
};

// Function to authenticate user based on username and password
const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username);
  return user && user.password === password; // Check if username and password match
};

// Route for logging in a user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;  // Get username and password from request body

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Authenticate the user
  if (!isValid(username)) {
    return res.status(401).json({ message: "User not found." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password." });
  }

  // Create JWT token
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour

  return res.status(200).json({ message: "Login successful", token });
});

// Route to add or update a book review (protected route)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { token } = req.headers;  // Get JWT from request headers
  const { review } = req.query; // Get review from query string
  const { isbn } = req.params; // Get ISBN from request params

  // Check if the JWT token is valid
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, secretKey); // Decodes the token
    const username = decoded.username; // Get the username from the decoded token

    // Find the book with the given ISBN
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found with this ISBN." });
    }

    // Check if the book has reviews
    if (!book.reviews) {
      book.reviews = [];
    }

    // Check if the user has already posted a review
    const existingReview = book.reviews.find(r => r.username === username);

    if (existingReview) {
      // Modify the existing review
      existingReview.review = review;
      return res.status(200).json({ message: "Review updated successfully." });
    } else {
      // Add a new review
      book.reviews.push({ username, review });
      return res.status(200).json({ message: "Review added successfully." });
    }

  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
});

// Export the routes
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

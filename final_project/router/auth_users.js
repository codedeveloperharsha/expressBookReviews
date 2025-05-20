const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid (simple example: non-empty string)
const isValid = (username) => {
  return username && typeof username === "string";
}

// Authenticate user credentials
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// Login route for registered users
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  let accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "Login successful." });
});

// Middleware to check authentication for review routes
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.authorization && req.session.authorization.username) {
    req.user = req.session.authorization.username;
    return next();
  }
  return res.status(403).json({ message: "User not authenticated." });
};

// Add or modify a book review
regd_users.put("/auth/review/:isbn", isAuthenticated, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required." });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully." });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", isAuthenticated, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review by user not found." });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

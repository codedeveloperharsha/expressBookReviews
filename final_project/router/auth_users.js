const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // This 'users' array must be populated with registered users for login to work.
                // Ensure your /register endpoint (in general.js) adds users to this array.

// Check if the username is valid (simple example: non-empty string)
const isValid = (username) => {
    return username && typeof username === "string" && username.trim() !== "";
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

    // Generate JWT token
    let accessToken = jwt.sign(
        { username: username }, // Payload: user information
        "access",                // Secret key (should be a strong, environment variable in production)
        { expiresIn: '1h' }      // Token expiration time
    );

    // Store token and username in session
    req.session.authorization = {
        accessToken,
        username
    };

    // **MODIFICATION HERE: Return the accessToken in the response**
    return res.status(200).json({ message: "Login successful.", accessToken: accessToken });
});

// Middleware to check authentication for review routes
// This middleware will be used with app.use("/customer/auth/*", ...) in index.js
// It needs to verify the JWT from the request header, not just the session.
// I'll provide the corrected index.js authentication middleware below as well,
// as these two pieces work together.
const isAuthenticated = (req, res, next) => {
    // This middleware is usually applied *after* the session-based authentication in index.js
    // and would primarily verify the token that was *sent by the client* in the Authorization header.
    // However, given the project structure, if index.js handles the JWT verification
    // and sets req.user from the session, this middleware might be redundant
    // or used for a different purpose in a more complex setup.
    // For this project, the core authentication logic should be in index.js's app.use("/customer/auth/*", ...)
    // which then allows access to routes defined in auth_users.js.

    // For the purpose of *this* file's routes, if index.js sets req.user based on a verified token/session:
    if (req.user) { // Assuming req.user is set by the main authentication middleware in index.js
        return next();
    }
    return res.status(403).json({ message: "User not authenticated. Please log in." });
};


// Add or modify a book review
regd_users.put("/review/:isbn", isAuthenticated, (req, res) => { // Removed /auth from path here, as it's handled by middleware in index.js
    const isbn = req.params.isbn;
    const review = req.query.review; // Project mentioned review as request query [cite: 34]
    const username = req.user.username; // Access username from decoded JWT payload in req.user

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required." });
    }

    // Initialize reviews object if it doesn't exist for the book
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully.", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/review/:isbn", isAuthenticated, (req, res) => { // Removed /auth from path here
    const isbn = req.params.isbn;
    const username = req.user.username; // Access username from decoded JWT payload in req.user

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review by this user not found for this book." });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully.", reviews: books[isbn].reviews });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users; // Make sure your /register route pushes users into this array.
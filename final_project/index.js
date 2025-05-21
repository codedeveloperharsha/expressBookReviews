// index.js
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer", // This should be a strong, unique secret key
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware for protected routes
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        const token = req.session.authorization.accessToken;
        // Verify the token using your secret key ("access")
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user; // Store the decoded user payload (e.g., { username: 'Sai' }) in req.user
                next(); // Proceed to the next middleware/route handler
            } else {
                // If there's an error during verification (e.g., invalid token, expired token)
                return res.status(403).json({ message: "User not authenticated or token invalid/expired." });
            }
        });
    } else {
        // If no authorization data is found in the session
        return res.status(403).json({ message: "User not logged in." });
    }
});

// Declare PORT only ONCE
const PORT = 5000;

app.use("/customer", customer_routes); // Routes from auth_users.js are mounted under /customer
app.use("/", genl_routes); // Routes from general.js are mounted under the root path /

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// *** Remove this commented-out section if it's still in your file ***
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const session = require('express-session');
// const customer_routes = require('./router/auth_users.js').authenticated;
// const genl_routes = require('./router/general.js').general;

// const app = express();
// app.use(express.json());

// app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// app.use("/customer/auth/*", function auth(req, res, next) {
//     if (req.session.authorization) {
//         jwt.verify(req.session.authorization.accessToken, "access", (err, user) => {
//             if (!err) {
//                 req.user = user;
//                 next();
//             } else {
//                 return res.status(403).json({ message: "User not authenticated" });
//             }
//         });
//     } else {
//         return res.status(403).json({ message: "User not logged in" });
//     }
// });

// const PORT = 5000; // THIS LINE IS THE PROBLEM IF IT'S NOT COMMENTED OUT OR PART OF A DUPLICATE BLOCK

// app.use("/customer", customer_routes);
// app.use("/", genl_routes);

// app.listen(PORT, () => console.log("Server is running"));
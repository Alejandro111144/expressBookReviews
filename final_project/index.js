const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Middleware to authenticate the user based on session or token
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if there's a valid session and an access token
  const token = req.session.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  // Verify the token
  jwt.verify(token, "your_secret_key", function (err, decoded) {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    
    // Attach user info to request object for use in subsequent routes
    req.user = decoded; 
    next();
  });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));

// Import necessary modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create an Express application instance
const app = express();
const port = 3000; // Or any port you prefer

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Define a route for the root URL to serve your index.html from the frontend directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// SQLite database setup
// Connect to the database in the 'backend' folder. If the file doesn't exist, it will be created.
const db = new sqlite3.Database('./backend/test_data.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // You can perform initial database setup here (e.g., create tables)
    // For example:
    /*
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)', (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Users table created or already exists.');
      }
    });
    */
  }
});

// Add other routes and API endpoints here as you build your dynamic features

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Close the database connection when the server stops (optional but good practice)
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

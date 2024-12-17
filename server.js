// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Middleware to parse form data and handle file uploads
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setup file upload with Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Database connection pool
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Connect to the database
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the PostgreSQL database!');
});

// Endpoint to handle form submission
app.post('/submit-article', upload.single('uploaded_file'), async (req, res) => {
  const {
    item,
    author,
    title,
    content,
    Madeby,
    Model,
    Price,
    recommended_car,
    Writenby,
    ISNB,
    Pages,
    recommended,
  } = req.body;

  let query = '';
  let values = [];

  try {
    if (item === 'Artikel') {
      query = 'INSERT INTO articles (author, title, content) VALUES ($1, $2, $3)';
      values = [author, title, content];
    } else if (item === 'Car') {
      query = 'INSERT INTO cars (made_by, model, price, recommended, author, title, content) VALUES ($1, $2, $3, $4, $5, $6, $7)';
      values = [Madeby, Model, Price, recommended_car, author, title, content];
    } else if (item === 'Book') {
      query = 'INSERT INTO books (written_by, isbn, pages, price, recommended, author, title, content) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
      values = [Writenby, ISNB, Pages, Price, recommended, author, title, content];
    }

    const result = await pool.query(query, values);
    res.status(200).send('Data successfully submitted!');
  } catch (err) {
    console.error('Error executing query:', err.message);
    res.status(500).send('Error adding data to the database.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

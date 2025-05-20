const axios = require('axios');
const BASE_URL = 'http://localhost:5000'; // Your server should be running on this port

// Task 10: Get all books – Using async callback function
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("\n📚 All Books:\n", response.data);
  } catch (error) {
    console.error("❌ Error fetching all books:", error.message);
  }
}

// Task 11: Search by ISBN – Using Promises
function getBookByISBN(isbn) {
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => {
      console.log(`\n🔍 Book with ISBN ${isbn}:\n`, response.data);
    })
    .catch(error => {
      console.error("❌ Error fetching book by ISBN:", error.message);
    });
}

// Task 12: Search by Author – Using async/await
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${author}`);
    console.log(`\n👤 Books by Author "${author}":\n`, response.data);
  } catch (error) {
    console.error("❌ Error fetching books by author:", error.message);
  }
}

// Task 13: Search by Title – Using Promises
function getBooksByTitle(title) {
  axios.get(`${BASE_URL}/title/${title}`)
    .then(response => {
      console.log(`\n📖 Books with Title "${title}":\n`, response.data);
    })
    .catch(error => {
      console.error("❌ Error fetching book by title:", error.message);
    });
}

// Run all methods for demonstration
(async () => {
  await getAllBooks();             // Task 10
  getBookByISBN(1);                // Task 11
  await getBooksByAuthor("Unknown"); // Task 12
  getBooksByTitle("Pride and Prejudice"); // Task 13
})();

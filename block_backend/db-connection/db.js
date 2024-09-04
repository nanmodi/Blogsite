const mongoose = require('mongoose');
const dotenv=require('dotenv')
dotenv.config();


async function createConnection() {
  try {
    // Connect to MongoDB
    const db = await mongoose.connect(`mongodb+srv://nandinimodi22b:${process.env.mongodbpassword}@cluster0.4oqwfca.mongodb.net/blogpost`);
    console.log('Connected to MongoDB');
    return db; // Return the connection object
  } catch (error) {
    console.error('Error in connection:', error);
    throw error; // Throw the error to handle it in the calling code
  }
}

// Export the createConnection function
module.exports = createConnection;

  

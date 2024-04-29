const fs = require('fs');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017/mydatabase';

// Function to fetch data from MongoDB and save it to a text file
async function downloadDataToTxt() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();

    const database = client.db();
    const collection = database.collection('mycollection');

    // Query MongoDB to fetch data
    const data = await collection.find({}).toArray();

    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2); // Using null and 2 for pretty formatting

    // Write JSON data to a text file
    fs.writeFileSync('data.txt', jsonData);

    console.log('Data downloaded and saved to data.txt');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

module.exports = { downloadDataToTxt };
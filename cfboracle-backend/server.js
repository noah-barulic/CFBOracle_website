const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Initialize Express App
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let footballData = [];

// OpenAI API key (replace with your actual key)
const apiKey = '[Replace Here]'; // <-- Place your OpenAI API key here

// Load CSV data into memory on server start
function loadCSVData() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'football_data.csv');
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        footballData = results;
        console.log('CSV Data Loaded Successfully');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error reading CSV file:', err);
        reject(err);
      });
  });
}

// Function to find relevant rows based on user query
function findRelevantRows(query) {
  const teamKeywords = query.split(' ').filter(word => word.length > 2); // Basic keyword splitting
  
  return footballData.filter(row => {
    return teamKeywords.some(keyword => 
      row['Home Team'].toLowerCase().includes(keyword.toLowerCase()) ||
      row['Away Team'].toLowerCase().includes(keyword.toLowerCase())
    );
  });
}

// Full explanation of the dataset to send along with the query
function getDatasetExplanation() {
  return `
    The dataset you are working with is a football dataset that provides information about matchups between teams. Each row represents a unique game during the regular season, with the following columns:

    - Year: The year the game was played.
    - Week: The week of the regular season.
    - Home Team: The team playing at home.
    - Away Team: The team playing away.
    - Avg_Home_Score: The average predicted score for the home team based on simulations.
    - Avg_Away_Score: The average predicted score for the away team based on simulations.
    - %Win Home: The predicted probability of the home team winning.
    - %Win Away: The predicted probability of the away team winning.
    - Predicted Spread: The predicted point spread (e.g., "Alabama -32.17" means Alabama is favored by 32.17 points).
    - Over_Under: The predicted total points scored by both teams.
    - Actual_Home_Score: The actual score of the home team (if available).
    - Actual_Away_Score: The actual score of the away team (if available).
    - Home_Offensive_Performance: A performance rating for the home team's offense.
    - Away_Offensive_Performance: A performance rating for the away team's offense.
    - Home_Defensive_Performance: A performance rating for the home team's defense.
    - Away_Defensive_Performance: A performance rating for the away team's defense.
    - Vegas_Spread: The spread set by Vegas bookmakers.
    - Vegas_Total: The total points predicted by Vegas bookmakers.

    Important Points:
    1. The dataset may not explicitly tell you which team is home or away unless it's specified by the user.
    2. When answering questions, you must search both the Home Team and Away Team fields, as either team could be home or away based on the user's query.
    3. Handle ambiguous or missing data carefully. Ask for clarification if needed.

    Based on the user's query and the following relevant data from the dataset, please generate a response.
  `;
}

// API endpoint for handling user queries
app.post('/api/query', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    // Find relevant rows from the CSV based on the query
    const relevantRows = findRelevantRows(query);

    if (relevantRows.length === 0) {
      return res.json({
        gptResponse: "No relevant data found for your query."
      });
    }

    // Prepare a small subset of data to send to GPT
    const dataSummary = relevantRows.slice(0, 5).map(row => JSON.stringify(row)).join('\n'); // Send only the first 5 rows to reduce size

    // Combine the dataset explanation, relevant rows, and the user's query
    const fullPrompt = `
      ${getDatasetExplanation()}
      
      Relevant data:
      ${dataSummary}
      
      Now, answer the following question based on this dataset:
      User's question: "${query}".
    `;

    // Send the prompt to GPT-4 for interpretation
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // Use your OpenAI API key here
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // <-- Changed to GPT-3.5-turbo (or use "gpt-4" for non-turbo)
        messages: [
          { role: "system", content: "You are an assistant that helps answer questions based on a football dataset." },
          { role: "user", content: fullPrompt }
        ],
        max_tokens: 500, // Adjust based on expected response length
        temperature: 0.5,
      }),
    });

    const gptResponseData = await gptResponse.json();

    if (gptResponseData.choices && gptResponseData.choices.length > 0) {
      const gptReply = gptResponseData.choices[0].message.content.trim();
      console.log('GPT Response:', gptReply);

      // Return GPT's response directly to the user
      return res.json({
        gptResponse: gptReply,   // The response generated by GPT
      });
    } else {
      console.error('Unexpected GPT response format:', gptResponseData);
      return res.status(500).json({ error: 'Unexpected response format from GPT-4-turbo' });
    }

  } catch (error) {
    console.error('Error occurred while processing the query:', error);
    res.status(500).json({ error: 'An error occurred while processing your query.' });
  }
});

// Load the CSV data and then start the server
loadCSVData().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});

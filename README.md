
College Football AI Predictions Website
This is a web application that allows users to ask questions about college football and receive AI-generated predictions. The predictions are based on historical data of games, and the website integrates OpenAI's GPT-3.5 to provide detailed responses. It also supports data visualization for certain predictions.

Features
    User Query Submission: Users can enter questions about college football matchups, predictions, or stats.
    AI Responses: The backend processes the queries using OpenAI's GPT-3.5 or GPT-4 and sends back natural language responses.
    Clarification Handling: If a question is unclear, the system prompts the user to clarify the query.
    Data Visualization: Optionally, visual predictions can be displayed using Chart.js.
    CSV Data Parsing: The backend uses a dataset of football game data to assist the AI in generating predictions.
Frontend
Files:
    index.html: The main webpage that users interact with.
Key Components:
    Search bar: Where users can type questions.
    Results section: Displays AI-generated responses.
    Chart Visualization: Placeholder for chart visualization (optional, uses Chart.js).
    Loading Animation: Swirling dots animation to indicate when the AI is processing a query.
How It Works:
    The user enters a question related to college football.
    The question is sent to the backend for processing.
    The result is displayed on the same page, including clarifications or visualizations if needed.
Libraries Used:
    Chart.js: Used for rendering visualizations based on prediction data.
    CSS Animations: Swirling dots animation to indicate the loading state while the AI processes the request.
Backend
Files:
    app.js: The backend server built using Node.js and Express.
    football_data.csv: The dataset file containing historical football data for AI reference.
How It Works:
    The server listens for POST requests at the /api/query endpoint.
    It processes the query and looks for relevant data in the football_data.csv file.
    A detailed prompt is constructed with the relevant data and sent to OpenAI's GPT-3.5 or GPT-4 API.
    The AI generates a response based on the user's query and the dataset.
    The response is returned to the frontend, where it is displayed to the user.
API Endpoint:
    POST /api/query: Receives a query and returns an AI-generated response.
    Request Body: {"query": "<user's question>"}
Libraries Used:
    Express.js: Handles the server and API routing.
    CSV Parser: Reads and parses football data from a CSV file.
    Node-Fetch: Used to make API calls to OpenAI's GPT model.
How to Run the Backend:
    Install dependencies:
        bash
    Copy code
    npm install
    Add your OpenAI API key to the app.js file.
    Start the server:
        bash
    Copy code
    node app.js
    Ensure the frontend is configured to send requests to http://localhost:3000/api/query.
Setup Instructions
Prerequisites:
    Node.js installed for running the backend server.
    OpenAI API Key for generating AI responses.
Steps:
    Clone the repository.
    Run the backend server using the instructions in the backend section.
    Open index.html in a web browser for the frontend.
    Ensure the backend is running and accepting queries from the frontend.
Credits
    Created by Noah Barulic.
    Powered by OpenAI ChatGPT-3.5 / GPT-4.

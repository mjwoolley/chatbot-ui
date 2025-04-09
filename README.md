# Chatbot UI

A simple frontend interface for interacting with the Chatbot API.

## Project Structure

- `index.html` - Main HTML file with the user interface
- `styles.css` - CSS styling for the application
- `script.js` - JavaScript code for API interactions

## Development

### Local Setup

1. Clone this repository
2. Open the `index.html` file in your browser or use a local server

### Using a Local Server

You can use any static file server. Here are a few options:

#### Using Python (if installed):

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

#### Using Node.js (if installed):

```bash
# Install serve globally (one-time setup)
npm install -g serve

# Run the server
serve -s .
```

### API Connection

The UI will automatically connect to:
- Local development API: `http://localhost:5000` when running locally
- Production API: The App Runner URL when deployed

## Deployment

To deploy this UI:
1. Upload the files to a static hosting service like AWS S3, Netlify, or GitHub Pages
2. Update the production URL in `script.js` if needed

## Features

- Simple button to test API connectivity
- Displays API responses

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const helloButton = document.getElementById('hello-btn');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const modelSelector = document.getElementById('model-selector');
    
    // API URL - will need to be updated based on your deployment
    const apiUrl = {
        // Local development URL
        dev: 'http://localhost:5000',
        // Production URL (update this with your App Runner service URL)
        prod: 'https://cjgi3jebg2.us-east-1.awsapprunner.com'
    };
    
    // For debugging - force using the local development URL
    // This ensures we're connecting to the right server during testing
    const baseUrl = apiUrl.dev;
    
    console.log('Using API base URL:', baseUrl);
    
    // Current selected model ID
    let currentModelId = null;
    
    // Fetch available models from the API
    async function fetchAvailableModels() {
        try {
            // Log the URL we're trying to fetch
            const modelsUrl = `${baseUrl}/api/models`;
            console.log('Fetching models from:', modelsUrl);
            
            // Add explicit mode and credentials for CORS
            const response = await fetch(modelsUrl, {
                method: 'GET',
                mode: 'cors',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
            }
            
            // Log the raw response
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            // Parse the response as JSON
            const data = JSON.parse(responseText);
            console.log('Parsed data:', data);
            
            // Clear the loading option
            modelSelector.innerHTML = '';
            
            // Add options for each model
            if (data.models && Array.isArray(data.models)) {
                data.models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = model.name;
                    modelSelector.appendChild(option);
                });
                
                // Set the default selected model
                if (data.models.length > 0) {
                    currentModelId = data.models[0].id;
                    // Add a system message indicating the selected model
                    addMessage(`Using model: <strong>${data.models[0].name}</strong>`, 'system');
                }
            } else {
                console.error('Invalid data format:', data);
                throw new Error('Invalid data format received from server');
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            modelSelector.innerHTML = '<option value="">Error loading models</option>';
            addMessage(`<strong>Error loading models:</strong> ${error.message}`, 'system');
            
            // As a fallback, let's provide some default models
            addMessage('Using default models as fallback', 'system');
            
            // Add default models
            const defaultModels = [
                { id: 'anthropic.claude-3-5-sonnet-20240620-v1:0', name: 'Claude 3.5 Sonnet' },
                { id: 'anthropic.claude-3-opus-20240229-v1:0', name: 'Claude 3 Opus' },
                { id: 'anthropic.claude-3-sonnet-20240229-v1:0', name: 'Claude 3 Sonnet' },
                { id: 'anthropic.claude-3-haiku-20240307-v1:0', name: 'Claude 3 Haiku' }
            ];
            
            // Clear the error option
            modelSelector.innerHTML = '';
            
            // Add the default models
            defaultModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                modelSelector.appendChild(option);
            });
            
            // Set the default selected model
            currentModelId = defaultModels[0].id;
        }
    }
    
    // Call the function to fetch models when the page loads
    fetchAvailableModels();
    
    // Add event listener for model selection change
    modelSelector.addEventListener('change', function() {
        currentModelId = this.value;
        const selectedModelName = this.options[this.selectedIndex].text;
        addMessage(`Switched to model: <strong>${selectedModelName}</strong>`, 'system');
    });
    
    // Function to add a message to the chat window
    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${type}-message`);
        messageDiv.innerHTML = content;
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat window
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Add click event listener to the hello button
    helloButton.addEventListener('click', async function() {
        // Show loading message
        addMessage('Calling Hello API...', 'system');
        
        try {
            // Make API call to the hello endpoint
            const response = await fetch(`${baseUrl}/api/hello`);
            
            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Parse the JSON response
            const data = await response.json();
            
            // Display the response
            addMessage(`<strong>Hello API:</strong> ${data.message}`, 'api');
        } catch (error) {
            // Handle any errors
            console.error('Error calling Hello API:', error);
            addMessage(`<strong>Error:</strong> ${error.message}`, 'system');
        }
    });
    
    // Add submit event listener to the chat form
    chatForm.addEventListener('submit', async function(event) {
        // Prevent the form from submitting normally
        event.preventDefault();
        
        // Get the user input
        const userMessage = userInput.value.trim();
        
        // Don't do anything if the input is empty
        if (!userMessage) return;
        
        // Display the user's message in the chat window
        addMessage(userMessage, 'user');
        
        // Clear the input field
        userInput.value = '';
        
        // Show loading message
        addMessage('Thinking...', 'system');
        
        try {
            // Make API call to the chat endpoint with the selected model
            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    prompt: userMessage,
                    model_id: currentModelId 
                })
            });
            
            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Parse the JSON response
            const data = await response.json();
            
            // Remove the loading message
            chatMessages.removeChild(chatMessages.lastChild);
            
            // Display the API response
            addMessage(data.response, 'api');
        } catch (error) {
            // Handle any errors
            console.error('Error calling Chat API:', error);
            
            // Remove the loading message
            chatMessages.removeChild(chatMessages.lastChild);
            
            // Display the error message
            addMessage(`<strong>Error:</strong> ${error.message}`, 'system');
        }
    });
    
    // Focus the input field when the page loads
    userInput.focus();
});

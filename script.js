const memory = [{
	role: "system",
	content: "You are a web developer bot. You don't talk, you don't explain your answers. Your only output is made of code to satisfy the received request. You will not explain the code, you will not introduce it, you will not greet or thank the user for the request, you will only produce a well structured code line by line without interruptions and without dividing it in sections."
}];

function saveAPIKey() {
	const apiKey = document.getElementById('apiKeyInput').value;
	localStorage.setItem('openaiApiKey', apiKey);
	alert('API Key saved successfully!');
}
  
async function sendMessage() {
	const promptInput = document.getElementById('promptInput');
	const userMessage = promptInput.value.trim();

	if (userMessage) {
		showMessage(userMessage, 'user');
		promptInput.value = '';
		
		memory.push({ role: "user", content: userMessage });
		
		const typingIndicator = document.createElement('div');
		typingIndicator.className = 'typing-indicator text-gray-500 mt-2';
		typingIndicator.textContent = 'Bot is typing';
		document.getElementById('chatWindow').appendChild(typingIndicator);
		
		try {
		const response = await getChatGPTResponse();
		console.log("Response: " + response);
		typingIndicator.remove();
		showMessage(response.content, 'bot');
		memory.push({ role: "assistant", content: response.content });
		} catch (error) {
		typingIndicator.remove();
		showMessage('An error occurred. Please try again.', 'error');
		}
	}
}

function showMessage(message, sender) {
	const chatWindow = document.getElementById('chatWindow');
	const messageDiv = document.createElement('div');
	messageDiv.className = `message ${sender}-message mb-4 p-4 rounded-lg ${sender === 'user' ? 'bg-indigo-100 text-right' : 'bg-gray-100'}`;

	if (sender === 'bot') {
		const converter = new showdown.Converter();
		const safeMessage = DOMPurify.sanitize(message);
		const htmlMessage = converter.makeHtml(safeMessage);
		
		const iframe = document.createElement('iframe');
		iframe.srcdoc = `
		<html>
			<head>
			<base target="_blank">
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css">
			<script src="https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js"><\/script>
			</head>
			<body class="p-4">
			${htmlMessage}
			</body>
		</html>
		`;
		messageDiv.appendChild(iframe);
	} else {
		messageDiv.textContent = message;
	}

	chatWindow.appendChild(messageDiv);
	chatWindow.scrollTop = chatWindow.scrollHeight;
}
  
async function getChatGPTResponse() {
	const apiKey = localStorage.getItem('openaiApiKey');
	if (!apiKey) {
		throw new Error('API Key not found. Please save your OpenAI API Key.');
	}

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
		'Authorization': `Bearer ${apiKey}`,
		'Content-Type': 'application/json'
		},
		body: JSON.stringify({
		// Chose your model here by uncommenting the relevant line. 4o is default
        //model: "gpt-3.5-turbo-0125",
        model: "gpt-4o-mini",
		messages: memory,
		temperature: 0.7
		})
	});

	if (!response.ok) {
		throw new Error('Failed to get response from OpenAI API');
	}

	const data = await response.json();
	return data.choices[0].message;
}

function downloadChat() {
	const chatContent = memory.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
	const blob = new Blob([chatContent], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'chat_history.txt';
	a.click();
	URL.revokeObjectURL(url);
	}

	function clearChat() {
		memory.length = 1; // Keep only the system prompt
		document.getElementById('chatWindow').innerHTML = '';
	}

	// Load API key from localStorage on page load
	document.addEventListener('DOMContentLoaded', () => {
	const savedApiKey = localStorage.getItem('openaiApiKey');
	if (savedApiKey) {
		document.getElementById('apiKeyInput').value = savedApiKey;
	}
});
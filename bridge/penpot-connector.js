/**
 * Penpot Connector
 * Intended to be injected into the Penpot iframe or used as a plugin.
 */
class PenpotConnector {
    constructor(bridgeApiUrl = 'http://localhost:8080') {
        this.bridgeApiUrl = bridgeApiUrl;
        this.wsUrl = 'ws://localhost:8081';
        this.ws = null;
        this.init();
    }

    init() {
        console.log('Initializing Penpot Connector...');
        this.connectWebSocket();
        this.injectUI();
    }

    connectWebSocket() {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
            console.log('Connected to Bridge');
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleEvent(data);
        };
    }

    handleEvent(data) {
        if (data.event === 'job_completed') {
            console.log('Image Generation Completed:', data.result);
            this.insertImageToCanvas(data.result.image_url);
        }
    }

    injectUI() {
        // In a real implementation, this would manipulate the DOM of the Penpot app
        // Since Penpot is running in an iframe, we need to ensure we have access (same origin or postMessage)
        // Here we simulate the creation of a toolbar
        console.log('Injecting AI Toolbar...');
        
        // This function would likely communicate via postMessage to the parent Electron window
        // which then talks to the Penpot webview/iframe.
    }

    async generateImage(prompt, width = 1024, height = 1024) {
        try {
            const response = await fetch(`${this.bridgeApiUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, width, height })
            });
            const data = await response.json();
            console.log('Generation Queued:', data);
            return data;
        } catch (error) {
            console.error('Generation Error:', error);
        }
    }

    async removeBackground(selectionId) {
        // Placeholder
        console.log('Removing background for', selectionId);
    }

    insertImageToCanvas(imageUrl) {
        // Logic to add the image to the active Penpot board
        console.log(`Inserting ${imageUrl} into Penpot canvas`);
    }
}

// Ensure it's available globally or as a module
if (typeof window !== 'undefined') {
    window.PenpotConnector = PenpotConnector;
}

module.exports = PenpotConnector;

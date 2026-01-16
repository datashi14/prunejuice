const express = require('express');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

class BridgeServer {
    constructor() {
        this.app = express();
        this.port = 8080;
        this.wss = null;
        this.pythonProcess = null;
        this.queue = [];
        this.processing = false;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(bodyParser.json());
    }

    setupRoutes() {
        // Status Check
        this.app.get('/health', (req, res) => res.json({ status: 'ok' }));

        // AI Generation
        this.app.post('/api/generate', (req, res) => this.handleGenerate(req, res));
        this.app.post('/api/inpaint', (req, res) => this.handleInpaint(req, res));
        this.app.post('/api/upscale', (req, res) => this.handleUpscale(req, res));
        
        // Models
        this.app.get('/api/models', (req, res) => this.proxyToPython(req, res, '/models'));
        this.app.post('/api/models/switch', (req, res) => this.proxyToPython(req, res, '/models/switch', 'POST'));

        // Queue
        this.app.get('/api/queue', (req, res) => {
            res.json({
                length: this.queue.length,
                processing: this.processing,
                current_job: this.currentJob || null
            });
        });
    }

    setupWebSocket() {
        this.wss = new WebSocket.Server({ port: 8081 });
        this.wss.on('connection', (ws) => {
            console.log('Client connected to WebSocket');
            ws.on('message', (message) => {
                console.log('Received:', message);
            });
        });
        console.log('WebSocket server started on port 8081');
    }

    broadcast(data) {
        if (!this.wss) return;
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    async handleGenerate(req, res) {
        const job = {
            id: Date.now().toString(),
            type: 'generate',
            params: req.body,
            status: 'pending'
        };

        this.queue.push(job);
        this.processQueue();

        res.json({ 
            job_id: job.id, 
            status: 'queued', 
            position: this.queue.length 
        });
    }

    async handleInpaint(req, res) {
         const job = {
            id: Date.now().toString(),
            type: 'inpaint',
            params: req.body,
            status: 'pending'
        };
        this.queue.push(job);
        this.processQueue();
        res.json({ job_id: job.id, status: 'queued' });
    }

    async handleUpscale(req, res) {
         const job = {
            id: Date.now().toString(),
            type: 'upscale',
            params: req.body,
            status: 'pending'
        };
        this.queue.push(job);
        this.processQueue();
        res.json({ job_id: job.id, status: 'queued' });
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        this.currentJob = this.queue.shift();

        this.broadcast({
            event: 'job_started',
            job_id: this.currentJob.id
        });

        try {
            // Check if Python server is ready, if not wait or fail
            // For now, assume Python server is running on port 8000
            const axios = require('axios'); // Lazy load
            
            const endpoint = this.currentJob.type === 'generate' ? '/generate' : 
                             this.currentJob.type === 'inpaint' ? '/inpaint' : '/upscale';

            const response = await axios.post(`http://localhost:8000${endpoint}`, this.currentJob.params);
            
            this.broadcast({
                event: 'job_completed',
                job_id: this.currentJob.id,
                result: response.data
            });

        } catch (error) {
            console.error('Job failed:', error.message);
            this.broadcast({
                event: 'job_error',
                job_id: this.currentJob.id,
                error: error.message
            });
        } finally {
            this.processing = false;
            this.currentJob = null;
            this.processQueue();
        }
    }

    async proxyToPython(req, res, path, method='GET') {
        try {
            const axios = require('axios');
            const url = `http://localhost:8000${path}`;
            const response = method === 'GET' ? await axios.get(url) : await axios.post(url, req.body);
            res.json(response.data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    startServices() {
        // Start Python Backend
        console.log("Starting Python Backend...");
        const pythonScript = path.join(__dirname, 'python_server.py');
        // Assuming python is in path. In prod, use bundled python.
        this.pythonProcess = spawn('python', [pythonScript], {
            cwd: path.dirname(__dirname),
            stdio: 'inherit'
        });

        this.pythonProcess.on('error', (err) => {
            console.error('Failed to start python backend:', err);
        });

        this.pythonProcess.on('close', (code) => {
            console.log(`Python backend exited with code ${code}`);
        });

        // Start API Server
        this.app.listen(this.port, () => {
            console.log(`Bridge API listening on port ${this.port}`);
        });
    }
}

// Start if run directly
if (require.main === module) {
    const server = new BridgeServer();
    server.startServices();
}

module.exports = BridgeServer;

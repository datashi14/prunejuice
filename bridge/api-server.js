const express = require('express');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

class BridgeServer {
    constructor() {
        this.app = express();
        this.port = 8080;
        this.wss = null;
        this.pythonProcess = null;
        this.queue = [];
        this.processing = false;
        this.completedJobs = {}; 
        this.token = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use('/outputs', express.static(path.join(__dirname, '../outputs')));
    }

    getToken() {
        if (this.token) return this.token;
        const tokenPath = path.join(__dirname, '.bridge_token');
        if (fs.existsSync(tokenPath)) {
            this.token = fs.readFileSync(tokenPath, 'utf8').trim();
            return this.token;
        }
        return null;
    }

    setupRoutes() {
        // 1. Health & Resource Management
        this.app.get('/health', async (req, res) => {
            try {
                const pythonHealth = await axios.get('http://127.0.0.1:8000/health');
                res.json({
                    bridge: 'ok',
                    backend: pythonHealth.data
                });
            } catch (e) {
                res.json({ bridge: 'ok', backend: 'offline' });
            }
        });

        this.app.post('/api/recover', async (req, res) => {
            try {
                const response = await axios.post('http://127.0.0.1:8000/recover', {}, {
                    headers: { 'X-Bridge-Token': this.getToken() }
                });
                res.json(response.data);
            } catch (e) {
                res.status(500).json({ error: 'Recovery failed', details: e.message });
            }
        });

        // 2. Job Protocol
        this.app.post('/api/generate', (req, res) => this.handleJobSubmission(req, res, 'generate'));
        
        // 3. Queue & Status
        this.app.get('/api/queue', (req, res) => {
            res.json({
                length: this.queue.length,
                processing: this.processing,
                current_job: this.currentJob ? { id: this.currentJob.id, type: this.currentJob.type } : null
            });
        });

        this.app.get('/api/job/:id', (req, res) => {
            const jobId = req.params.id;
            if (this.completedJobs[jobId]) return res.json(this.completedJobs[jobId]);
            if (this.currentJob && this.currentJob.id === jobId) return res.json({ status: 'processing' });
            const queuedJob = this.queue.find(j => j.id === jobId);
            if (queuedJob) return res.json({ status: 'queued', position: this.queue.indexOf(queuedJob) });
            res.status(404).json({ error_code: 'JOB_NOT_FOUND', message: 'Job ID does not exist' });
        });

        this.app.delete('/api/job/:id', (req, res) => {
            const jobId = req.params.id;
            const index = this.queue.findIndex(j => j.id === jobId);
            if (index !== -1) {
                this.queue.splice(index, 1);
                return res.json({ status: 'cancelled' });
            }
            if (this.currentJob && this.currentJob.id === jobId) {
                // We don't support hard killing python but we can clear it from bridge
                this.currentJob.cancelled = true;
                return res.json({ status: 'cancelling', note: 'Will skip next broadcast' });
            }
            res.status(404).json({ error: 'Job not found or already finished' });
        });

        // 4. Proxy Styles & Models
        this.app.get('/api/styles', (req, res) => this.proxyToPython(req, res, '/styles'));
        this.app.get('/api/models', (req, res) => this.proxyToPython(req, res, '/models'));
        this.app.post('/api/models/switch', (req, res) => this.proxyToPython(req, res, '/models/switch', 'POST'));
    }

    setupWebSocket() {
        this.wss = new WebSocket.Server({ port: 8081 });
        console.log('Progress WebSocket started on port 8081');
    }

    broadcast(data) {
        if (!this.wss) return;
        const msg = JSON.stringify(data);
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(msg);
        });
    }

    async handleJobSubmission(req, res, type) {
        // Backpressure: Limit queue size
        if (this.queue.length > 5) {
            return res.status(429).json({
                error_code: 'QUEUE_FULL',
                message: 'Too many requests. Please wait for current jobs to finish.'
            });
        }

        const job = {
            id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            type,
            params: req.body,
            status: 'queued',
            submitted_at: new Date().toISOString()
        };

        this.queue.push(job);
        this.processQueue();

        res.status(202).json({ 
            job_id: job.id, 
            status: 'queued', 
            position: this.queue.length 
        });
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        this.currentJob = this.queue.shift();
        this.broadcast({ event: 'job_started', job_id: this.currentJob.id });

        try {
            const endpoint = `/${this.currentJob.type}`;
            const response = await axios.post(`http://127.0.0.1:8000${endpoint}`, this.currentJob.params, {
                headers: { 'X-Bridge-Token': this.getToken() },
                timeout: 300000 // 5 minute timeout for local inference
            });
            
            let result = response.data;
            if (result && result.image_url) {
                const fileName = path.basename(result.image_url);
                result.image_url = `http://localhost:${this.port}/outputs/${fileName}`;
            }

            if (!this.currentJob.cancelled) {
                this.completedJobs[this.currentJob.id] = { status: 'completed', result };
                this.broadcast({ event: 'job_completed', job_id: this.currentJob.id, result });
            }

        } catch (error) {
            const errorInfo = error.response?.data?.detail || {
                error_code: 'INFRASTRUCTURE_ERROR',
                message: error.message
            };
            
            console.error(`[Job ${this.currentJob.id}] Failed:`, errorInfo);
            
            this.completedJobs[this.currentJob.id] = { status: 'failed', error: errorInfo };
            this.broadcast({ event: 'job_failed', job_id: this.currentJob.id, error: errorInfo });
            
        } finally {
            this.processing = false;
            this.currentJob = null;
            setTimeout(() => this.processQueue(), 50); // Small breath
        }
    }

    async proxyToPython(req, res, endpoint, method = 'GET') {
        try {
            const config = {
                headers: { 'X-Bridge-Token': this.getToken() }
            };
            const url = `http://127.0.0.1:8000${endpoint}`;
            const response = method === 'GET' ? await axios.get(url, config) : await axios.post(url, req.body, config);
            res.json(response.data);
        } catch (error) {
            const msg = error.response?.data?.detail || error.message;
            res.status(error.response?.status || 500).json({ error: msg });
        }
    }

    startServices() {
        console.log("Launching Prune Juice Backend...");
        const pythonScript = path.join(__dirname, 'python_server.py');
        this.pythonProcess = spawn('python', [pythonScript], {
            cwd: path.dirname(__dirname),
            stdio: 'inherit'
        });

        this.app.listen(this.port, '127.0.0.1', () => {
            console.log(`Bridge API active at http://127.0.0.1:${this.port}`);
        });
    }
}

if (require.main === module) {
    new BridgeServer().startServices();
}

module.exports = BridgeServer;

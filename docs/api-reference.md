# API Reference

The Bridge API runs on port `8080`.

## Endpoints

### `POST /api/generate`

Generate an image using the loaded AI model.

**Request Body:**

```json
{
  "prompt": "A futuristic city...",
  "width": 1024,
  "height": 1024,
  "style": "cyberpunk"
}
```

**Response:**

```json
{
  "job_id": "1705392...",
  "status": "queued",
  "position": 1
}
```

### `GET /api/queue`

Get current queue status.

**Response:**

```json
{
  "length": 0,
  "processing": false,
  "current_job": null
}
```

### `GET /api/models`

List available models.

## WebSocket Events

Connect to `ws://localhost:8081`.

- `job_started`: Note that a job has begun processing.
- `job_completed`: Payload covers the resulting image URL.
- `job_error`: Payload contains error details.

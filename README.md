---

## 🚀 Getting Started

### 1. ✅ Prerequisites

Ensure you have the following installed on your system:
- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Node.js** (for local development): [Install Node.js](https://nodejs.org/)

### 2. 🔑 Environment Variables

Before running the application, you need to configure the environment variables. 

In the `./backend` directory, you'll find a sample environment file `env.sample`. 

Copy it to `.env`:

```bash
cp ./backend/env.sample ./backend/.env

docker compose up --build

mail server :: http://localhost:1080
bakcend server :: http://localhost:8000
web-frontend : http://localhost:3000


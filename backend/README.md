# Express Backend Project

## Complete Setup Guide

### Prerequisites
- Node.js (v16+)
- npm/yarn
- MySQL (for local dev)
- Docker (optional)

### One-Command Setup (copy-paste friendly)
```bash
# Clone and enter project
git clone https://github.com/prakashshahi1234/Artist-Management.git

#change dir to backend
cd backend

# Setup environment
cp .env.sample .env
# Edit .env with your config (DB credentials, etc.) for docker no need to change.

# Install dependencies
npm install

# Start development server
npm run dev

# OR for Docker setup:
docker-compose build && docker-compose up


#backend and email http server
http://localhost:8000
http://localhost:1080
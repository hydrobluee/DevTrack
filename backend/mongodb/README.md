# MongoDB Setup

This project uses Mongoose to connect to MongoDB. Ensure you have MongoDB installed and running locally or provide a remote URI.

Environment variables:

- MONGODB_URI: Connection string (e.g., mongodb://localhost:27017/cptracker)
- JWT_SECRET: Secret for signing JWTs

Start MongoDB (macOS Homebrew):

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Or use Docker:

```bash
docker run --name cptracker-mongo -p 27017:27017 -d mongo:6
```

After start, set `MONGODB_URI` and run the backend server.

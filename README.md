# CPier - Unified Coding Profile Dashboard 🚀

CPier is your one-stop dashboard that aggregates competitive programming profiles from LeetCode, CodeChef, and CodeForces. Get a 360° view of your coding journey with unified statistics, combined heatmaps, and integrated contest calendars.

## ✨ Features

### 📊 Unified Analytics

- Single-view dashboard for all platforms
- Combined problem-solving statistics
- Performance comparison across platforms
- Rating progress visualization

### 🔥 Activity Heatmap

- Unified coding activity visualization
- Platform-specific activity breakdown
- Custom date range selection

### 🗓 Contest Management

- Aggregated contest calendar
- Google Calendar integration
- Contest reminders and notifications
- Platform filter options

### ⚙️ User Experience

- Customizable dashboard
- Responsive design
- Exportable statistics

## 📸 Screenshots

![start](https://github.com/user-attachments/assets/9070e0e3-4ee6-46a1-ac84-4d8cdd10bfca)
![dashboard](https://github.com/user-attachments/assets/61b5b851-64ed-477a-895e-432c1deb4a87)
![codechef](https://github.com/user-attachments/assets/f3161a2f-dcdd-4493-9446-5bf1cec801ac)
![codeforce](https://github.com/user-attachments/assets/6b2c9843-5f25-4c1e-b07a-b7bb4aa591bf)
![contest](https://github.com/user-attachments/assets/3db50c95-df31-4031-9d12-93ea7c1c2abe)

## 🛠 Tech Stack

**Frontend:**

- React.js
- Tailwind CSS

**Backend:**

- Node.js
- Express.js
- Cheerio (Web scraping)

**Database:**

- MongoDB (via Mongoose)

## 🌐 Live Demo

Experience CPier at [https://cp-tracker-mauve.vercel.app/](https://cp-tracker-mauve.vercel.app/)

## 👥 Contributors

---

## 🔁 Migration Notes (Supabase → MongoDB)

- Auth and session management were migrated from Supabase Auth to a JWT-based approach using MongoDB as the primary data store.
- The backend now uses Mongoose models in `/backend/models` and a MongoDB client in `/backend/mongodb/mongoClient.js`.
- Update your environment variables:
  - `MONGODB_URI` — your MongoDB connection string (e.g., `mongodb://localhost:27017/cptracker`)
  - `JWT_SECRET` — a secure secret for signing JWTs
- Frontend auth now uses a backend endpoint (`/api/auth/signup` and `/api/auth/login`) and stores the returned token in `localStorage`.

### Local Development

1. Set environment variables in `/backend/.env` and `/frontend/.env`.
2. Start MongoDB (e.g., `brew services start mongodb-community` or run via Docker).
3. Install and start servers:

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

### After migration cleanup

- Remove Supabase client from dependencies and run `npm install` in both `backend` and `frontend` to clean up lock files.
- Replace Supabase Auth flows or OAuth implementations with server-side equivalents if needed (Google OAuth currently not implemented in backend).

```bash
cd frontend
npm install
npm run dev
```

### Running tests (backend)

```bash
cd backend
npm install
npm test
```

### Data migration from Supabase/Postgres

1. Set `SUPABASE_DB_URL` environment variable to your Postgres connection string (Supabase DB URL).
2. Set `MONGODB_URI` to your MongoDB connection string.
3. Run the migration script:

```bash
cd backend
node migrations/supabaseToMongo.js
```

---

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/simpledee1701">
        <img src="https://avatars.githubusercontent.com/u/174812664?v=4" width="100px;" alt="John Doe" style="border-radius:50%;"/><br />
        <sub><b>Deepak V</b></sub>
      </a><br />
      <a href="https://www.linkedin.com/in/deepak-v-4254301b2/" title="LinkedIn">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" />
      </a>
      <br />
      <sub></sub>
    </td>
    <td align="center">
      <a href="https://github.com/suveerprasad">
        <img src="https://avatars.githubusercontent.com/u/150579516?v=4" width="100px;" alt="Sarah Williams" style="border-radius:50%;"/><br />
        <sub><b>Sai Suveer</b></sub>
      </a><br />
      <a href="https://www.linkedin.com/in/sai-suveer-96a65a1b8/" title="LinkedIn">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" />
      </a>
      <br />
      <sub></sub>
    </td>
  </tr>
</table>

# TaskArena

TaskArena is a full-stack competitive task challenge platform where two users can create head-to-head matches, assign timed tasks, submit work, and automatically compute winners.

The project is split into:

- `Backend/` - Express, MongoDB, JWT auth, cron jobs, uploads, match/task/result APIs
- `FrontEnd/TaskArena/` - React + Vite + Tailwind frontend

## Highlights

- User authentication with JWT
- One-on-one match creation between two players
- Turn-based task creation
- Multiple tasks can be created on the same day for a match
- Maximum 5 tasks per match
- Either participant can dispose a match
- DSA mode supports question-based task creation
- One DSA question maps to one subtask
- Time-bound submissions with upload support
- Result computation and head-to-head analytics
- Submission heatmap and player stats
- Futuristic glassmorphism UI

## Current Match Rules

- A match always contains exactly 2 players.
- The match creator gets the first turn.
- Only the current-turn player can create the next task.
- A single match can contain at most 5 tasks in total.
- A match can have multiple tasks on the same date.
- Any participant can dispose a match.
- Disposed matches are removed from the normal match list.
- DSA tasks can be created with a question count, where each question becomes one subtask.

## Tech Stack

### Frontend

- React
- React Router
- Axios
- React Hot Toast
- Tailwind CSS via Vite plugin
- Vite

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs
- Multer for file uploads
- node-cron for scheduled jobs

## Project Structure

```text
.
|-- Backend
|   |-- config
|   |-- controllers
|   |-- cron
|   |-- middleware
|   |-- models
|   |-- routes
|   |-- utils
|   `-- server.js
|-- FrontEnd
|   `-- TaskArena
|       |-- src
|       |   |-- components
|       |   |-- context
|       |   |-- pages
|       |   |-- services
|       |   `-- utils
|       `-- vite.config.js
`-- README.md
```

## Main User Flow

1. Register or log in.
2. Search for another user and create a match.
3. The current-turn player creates a timed task.
4. Both players submit work for each subtask.
5. Results are computed after the deadline or via the scheduled job.
6. Match analytics, score history, and activity heatmaps update over time.

## Backend Environment Variables

Create `Backend/.env` with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskarena
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=7d
```

## Installation

### 1. Install backend dependencies

```powershell
cd Backend
npm install
```

### 2. Install frontend dependencies

```powershell
cd FrontEnd\TaskArena
npm install
```

## Running Locally

### Start the backend

```powershell
cd Backend
npm run dev
```

Backend runs on `http://localhost:5000`.

### Start the frontend

```powershell
cd FrontEnd\TaskArena
npm run dev
```

Frontend runs on Vite's dev server, usually `http://localhost:5173`.

The frontend proxies:

- `/api` -> `http://localhost:5000`
- `/uploads` -> `http://localhost:5000`

## Available Scripts

### Backend

```powershell
npm start
npm run dev
```

### Frontend

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Matches

- `POST /api/matches`
- `GET /api/matches`
- `GET /api/matches/search-users?q=<query>`
- `GET /api/matches/:id`
- `GET /api/matches/:id/stats`
- `GET /api/matches/:id/activity`
- `PATCH /api/matches/:id/toggle-turn`
- `PATCH /api/matches/:id/constraint`
- `DELETE /api/matches/:id`

### Tasks

- `POST /api/tasks`
- `GET /api/tasks/templates`
- `GET /api/tasks/match/:matchId`
- `GET /api/tasks/today/:matchId`
- `GET /api/tasks/:id`

### Submissions

- `POST /api/submissions`
- `GET /api/submissions/task/:taskId`
- `GET /api/submissions/my/:taskId`
- `GET /api/submissions/tracking/:taskId`
- `PATCH /api/submissions/lock/:taskId`

### Results

- `POST /api/results/compute/:taskId`
- `GET /api/results/task/:taskId`
- `GET /api/results/match/:matchId`

### Uploads

- `POST /api/upload`

## Cron Jobs

The backend starts two scheduled jobs automatically:

- Daily turn toggle at `00:00`
- Auto result computation every `15 minutes`

## Core Data Models

### User

- `username`
- `email`
- `password`
- `totalWins`
- `totalLosses`
- `totalDraws`

### Match

- `players`
- `currentTurn`
- `status`
- `h2hStats`
- `nextConstraint`
- `disposedBy`
- `disposedAt`

### Task

- `title`
- `description`
- `category`
- `difficulty`
- `createdBy`
- `matchId`
- `participants`
- `date`
- `startTime`
- `endTime`
- `subtasks`
- `constraintText`

### Submission

- `userId`
- `taskId`
- `subtaskId`
- `submittedAt`
- `locked`
- `response`

### Result

- `taskId`
- `matchId`
- `winner`
- `isDraw`
- `playerAStats`
- `playerBStats`
- `clutchEvents`
- `insights`

## Frontend Pages

- `Login`
- `Signup`
- `Dashboard`
- `MatchView`
- `CreateTask`
- `TaskView`
- `SubmissionPage`
- `ResultsPage`

## Notable UI Behavior

- Protected routes redirect unauthenticated users
- Auth token is stored in `localStorage`
- Toast notifications are shown for success and error flows
- Match, task, and result views use animated card transitions
- The UI uses a shared futuristic theme with glass panels and neon accents

## Uploads

- File uploads are served from `Backend/uploads`
- Uploaded files are available through `/uploads/<filename>`

## Build

To create a production frontend build:

```powershell
cd FrontEnd\TaskArena
npm run build
```

## Future Improvements

- Add automated tests for critical game rules
- Add Docker setup for frontend and backend
- Add admin moderation tools
- Add notifications for turn changes and result availability
- Add richer analytics and match filters

## Notes

- The backend expects MongoDB to be reachable before startup.
- The frontend assumes the backend is running on port `5000` during development.
- Match and task rules are enforced on the backend, not just in the UI.

## License

This project currently does not declare a license.

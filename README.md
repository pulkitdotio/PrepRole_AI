# PrepRole AI

**PrepRole AI** is a full-stack, AI-powered interview preparation platform that helps candidates prepare for a specific job using their **resume, profile, and target job description**.

The platform analyzes how well a candidate matches a role and generates personalized technical questions, behavioral questions, skill-gap analysis, preparation recommendations, and an ATS-friendly tailored resume using **Google Gemini**.

## Live Demo

**Application:** `YOUR_LIVE_URL`

---

## Overview

Preparing for an interview often means switching between job descriptions, resumes, interview-question websites, and generic AI tools.

PrepRole AI brings that process into one application.

A user provides:

* Target job title
* Company name (optional)
* Job description
* Personal/profile information
* Existing PDF resume

PrepRole AI then uses this information to create a personalized interview preparation report based on the specific candidate and role.

---

## Features

### AI-Powered Interview Analysis

PrepRole AI combines the candidate's resume, profile, and target job description to generate a structured interview preparation report using Google Gemini.

### Role Match Score

The application generates a **0–100 match score** representing how closely the candidate's current profile aligns with the target position.

### Technical Interview Questions

Role-specific technical questions are generated along with:

* What the interviewer is evaluating
* Important concepts to cover
* Suggested answers

### Behavioral Interview Preparation

The application generates behavioral questions based on the candidate's background and the responsibilities of the target role.

### Skill-Gap Analysis

PrepRole AI identifies skills or areas where additional preparation may be required and categorizes gaps by severity.

### Personalized Preparation Plan

Based on the analysis, the application creates an actionable preparation roadmap to help the candidate focus on the most important areas before the interview.

### Resume Analysis

Users can upload an existing **PDF resume**.

The backend extracts the resume content and uses it as additional context when generating the interview report.

### AI-Tailored Resume

PrepRole AI can generate an **ATS-friendly PDF resume** tailored to the selected job while keeping the candidate's existing experience and background as the source material.

### Interview History

Authenticated users can save and manage previous interview reports.

Users can:

* View previous reports
* Revisit interview preparation
* Navigate paginated history
* Delete reports

### Dashboard Analytics

The dashboard provides an overview of the user's preparation activity, including:

* Total interviews
* Average match score
* Best match score

### Authentication

The application includes:

* User registration
* Login
* Logout
* Protected routes
* Session revocation
* Account deletion

---

## Tech Stack

### Frontend

* React 19
* Vite
* React Router
* Axios
* Sass
* Lucide React
* Lenis

### Backend

* Node.js
* Express 5
* MongoDB
* Mongoose
* Google Gemini (`@google/genai`)
* JWT
* bcryptjs
* Zod
* Multer
* pdf-parse
* Puppeteer
* Helmet
* express-rate-limit

---

## Architecture

```text
                    ┌─────────────────────┐
                    │       React UI      │
                    │       + Vite        │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │                     │
                    │ Auth • Validation   │
                    │ API • Rate Limits   │
                    └──────┬────────┬─────┘
                           │        │
                 ┌─────────┘        └─────────┐
                 ▼                            ▼
        ┌─────────────────┐          ┌─────────────────┐
        │     MongoDB     │          │  Google Gemini  │
        │                 │          │                 │
        │ Users           │          │ Interview       │
        │ Reports         │          │ Analysis        │
        │ Sessions        │          │ Resume Content  │
        └─────────────────┘          └─────────────────┘
```

---

## Project Structure

```text
.
├── backend/
│   ├── scripts/
│   │   └── syncIndexes.js
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── test/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── services/
│   │   └── styles/
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

---

## How It Works

### 1. Create an Account

Users register or sign in to access the interview preparation dashboard.

### 2. Enter the Target Role

The user provides information about the position they are preparing for, including the job title and job description.

### 3. Upload a Resume

The user's existing PDF resume is uploaded and its text is extracted by the backend.

### 4. Build Candidate Context

PrepRole AI combines the:

```text
Resume
   +
Candidate Profile
   +
Job Description
   ↓
Candidate / Role Context
```

### 5. Generate AI Analysis

The relevant context is sent to Google Gemini to generate structured interview preparation data.

### 6. Validate the Response

AI-generated output is validated against application schemas before being accepted and stored.

### 7. Display the Interview Report

The user receives a personalized report containing:

```text
Interview Report
├── Match Score
├── Technical Questions
├── Behavioral Questions
├── Skill Gaps
└── Preparation Plan
```

### 8. Generate a Tailored Resume

The saved interview context can also be used to generate an ATS-friendly resume for the target role.

---

## API Endpoints

### System

| Method | Endpoint  | Description                 |
| ------ | --------- | --------------------------- |
| `GET`  | `/health` | Application liveness check  |
| `GET`  | `/ready`  | Application readiness check |

### Authentication

| Method   | Endpoint             | Description                      |
| -------- | -------------------- | -------------------------------- |
| `POST`   | `/api/auth/register` | Create an account                |
| `POST`   | `/api/auth/login`    | Authenticate a user              |
| `POST`   | `/api/auth/logout`   | Log out and revoke the session   |
| `GET`    | `/api/auth/get-me`   | Get the authenticated user       |
| `DELETE` | `/api/auth/account`  | Delete the authenticated account |

### Interviews

| Method   | Endpoint                                       | Description                     |
| -------- | ---------------------------------------------- | ------------------------------- |
| `POST`   | `/api/interview`                               | Generate an interview report    |
| `GET`    | `/api/interview`                               | Get paginated interview history |
| `GET`    | `/api/interview/stats`                         | Get dashboard statistics        |
| `GET`    | `/api/interview/report/:interviewId`           | Get an interview report         |
| `DELETE` | `/api/interview/report/:interviewId`           | Delete an interview report      |
| `POST`   | `/api/interview/resume/pdf/:interviewReportId` | Generate a tailored resume PDF  |

Authentication is handled using an **HTTP-only cookie**.

---

## Local Development

Even though the application can be deployed, it can also be run locally for development.

### Prerequisites

Make sure you have:

* Node.js
* npm
* MongoDB
* Google Gemini API key

---

### 1. Get the Project

Clone or download the repository and open the project directory:

```bash
cd GenAI_Project
```

---

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` as a reference:

```env
NODE_ENV=development
PORT=3000

MONGO_URI=your_mongodb_connection_string

GOOGLE_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite

JWT_SECRET=your_strong_random_secret

CLIENT_URL=http://localhost:5173
COOKIE_SAME_SITE=lax
```

Generate a secure JWT secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

by default.

---

### 3. Frontend Setup

Open another terminal and navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` as a reference.

When an explicit backend URL is required:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Vite normally starts the application at:

```text
http://localhost:5173
```

---

## Production Configuration

After deployment, the frontend should communicate with the deployed backend rather than localhost.

For example:

```env
VITE_API_URL=YOUR_API_URL
```

The backend should allow requests from the deployed frontend:

```env
NODE_ENV=production

MONGO_URI=your_production_mongodb_connection

GOOGLE_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite

JWT_SECRET=your_secure_production_secret

CLIENT_URL=YOUR_LIVE_URL
```

Actual production values should be configured through the deployment platform's environment-variable settings.

**Never commit production secrets to the repository.**

---

## Resume Upload

Interview generation accepts a PDF resume using multipart form data.

The frontend currently enforces:

* PDF format
* Non-empty files
* Maximum file size of **3 MB**

The backend performs additional validation before extracting and processing resume content.

---

## Environment Variables

### Backend

| Variable           | Description                                       |
| ------------------ | ------------------------------------------------- |
| `NODE_ENV`         | Application environment                           |
| `PORT`             | Backend server port                               |
| `MONGO_URI`        | MongoDB connection string                         |
| `GOOGLE_API_KEY`   | Google Gemini API key                             |
| `GEMINI_MODEL`     | Gemini model used for AI generation               |
| `JWT_SECRET`       | Secret used for authentication tokens             |
| `CLIENT_URL`       | Allowed frontend origin                           |
| `CLIENT_URLS`      | Optional comma-separated list of allowed origins  |
| `COOKIE_SAME_SITE` | SameSite configuration for authentication cookies |

### Frontend

| Variable       | Description          |
| -------------- | -------------------- |
| `VITE_API_URL` | Backend API base URL |

---

## Available Scripts

### Backend

Development server:

```bash
npm run dev
```

Production server:

```bash
npm start
```

Tests:

```bash
npm test
```

Check MongoDB indexes:

```bash
npm run db:indexes:check
```

Synchronize MongoDB indexes:

```bash
npm run db:indexes
```

### Frontend

Development server:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

Tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

---

## Testing

Run backend tests:

```bash
cd backend
npm test
```

Run frontend tests:

```bash
cd frontend
npm test
```

The project includes tests covering areas such as:

* Authentication
* Request validation
* API errors
* HTTP security
* Rate limiting
* Database indexes
* Interview data security
* Resume PDF generation
* Pagination
* Session handling
* Server lifecycle behavior
* Routing helpers

---

## Security

Security is handled across multiple layers of the application.

### Authentication

* Password hashing with bcrypt
* JWT-based authentication
* HTTP-only authentication cookies
* Session revocation
* Per-user resource ownership checks

### API Protection

* Helmet security headers
* CORS restrictions
* Origin validation
* API rate limiting
* Additional rate limiting for expensive operations
* Zod request validation

### File Uploads

Resume files are validated before their contents are processed.

### AI Safety and Validation

User-provided content and resume text are treated as untrusted input when constructing AI requests.

AI-generated responses are validated against structured schemas before they are accepted or stored.

### Secrets

Sensitive values such as the following should never be committed:

```text
.env
MONGO_URI
GOOGLE_API_KEY
JWT_SECRET
```

Store production credentials using your deployment provider's environment-variable or secret-management system.

---

## Deployment

The application consists of two independently deployable parts:

```text
Frontend
   │
   │ HTTPS
   ▼
Backend API
   │
   ├──────────► MongoDB
   │
   └──────────► Google Gemini API
```

### Frontend

Create the production build with:

```bash
cd frontend
npm run build
```

The generated frontend can be hosted using a modern static/frontend hosting provider.

### Backend

Run the production server with:

```bash
cd backend
NODE_ENV=production npm start
```

The backend can be hosted on a Node.js-compatible hosting platform.

### Before Going Live

Verify that:

* Production environment variables are configured
* MongoDB is accessible from the backend
* Gemini API credentials are configured
* Frontend points to the production API
* Backend allows the production frontend origin
* HTTPS is enabled
* Authentication cookies work across the deployed origins
* MongoDB indexes are synchronized
* Rate limiting is configured appropriately

---

## Future Improvements

Potential future additions include:

* AI mock interviews
* Voice-based interview practice
* Real-time answer evaluation
* AI feedback on interview responses
* Resume scoring
* Multiple resume versions
* Saved target jobs
* Interview progress tracking
* Advanced dashboard analytics
* Company-specific interview preparation
* Exportable preparation reports

---

## License

This project is licensed under the **ISC License**.

---

## Disclaimer

PrepRole AI provides AI-generated interview preparation assistance. Generated questions, answers, match scores, skill-gap assessments, and resume suggestions should be treated as preparation guidance rather than guarantees of interview or hiring outcomes.

---

**Prep smarter. Understand your gaps. Walk into your next interview prepared.**

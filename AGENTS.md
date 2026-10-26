# AGENTS.md

> **Purpose**: This file documents project context, environment configuration, rules for AI coding assistants, and a chronological log of all changes made by AI agents with technical rationales.

---

## 🛠️ Project Overview

**InterviewIQ.AI** is a full-stack AI-powered mock interview web application.
* **Frontend (`/client`)**: React 19, Vite, Tailwind CSS v4, Redux Toolkit, React Router v7, Firebase Auth, Motion.
* **Backend (`/server`)**: Node.js (ES Modules), Express 5, MongoDB / Mongoose 9, JWT, OpenRouter AI (GPT-4o-mini), Razorpay.

---

## 📋 Environment Configuration Guide

### Server (`/server/.env`)
* `PORT`: Server port (default `8000`).
* `MONGODB_URL`: MongoDB Atlas connection string (`mongodb+srv://...`).
* `JWT_SECRET`: Secret key for JWT cookie signing.
* `OPENROUTER_API_KEY`: API key from [OpenRouter](https://openrouter.ai/keys) for AI questions and analysis.
* `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay credentials for credits payment.

### Client (`/client/.env`)
* `VITE_FIREBASE_APIKEY`: Firebase web API key.
* `VITE_RAZORPAY_KEY_ID`: Razorpay key for frontend checkout.

---

## 🤖 AI Agent Guidelines & Architecture Rules

1. **Module System**:
   * Both client and server use **ES Modules** (`"type": "module"` in `package.json`).
   * When importing local files in the backend, always include the `.js` extension (e.g. `import connectDb from "./config/connectDb.js"`).
   * Always load environment variables before module evaluation using `import "dotenv/config";`.

2. **CORS & Authentication**:
   * Authentication is cookie-based using JWT (`httpOnly: true`).
   * Frontend Axios requests that require authentication **must** include `{ withCredentials: true }`.
   * Express CORS must explicitly set `origin: "http://localhost:5173"` and `credentials: true`.

3. **Running the Application**:
   * Server must be run from `server/`: `npm run dev`.
   * Client must be run from `client/` (not `client/src/`): `npm run dev`.

4. **Developer Doubts & Knowledge Base**:
   * Do NOT update `DOUBTS.md` before or during answering a question.
   * First provide the complete answer/explanation directly to the user.
   * Ask the user if they understood it and whether they want it saved to `DOUBTS.md`.
   * Only record the question and explanation in `DOUBTS.md` after explicit user confirmation.

---

## 📜 Agent Change Log

### [2026-10-20] - Fixes for MongoDB SRV DNS & Environment Variable Hoisting

#### 1. MongoDB Atlas SRV Resolution (`querySrv ECONNREFUSED`)
* **File Modified**: `server/config/connectDb.js`
* **Change**: Added `dns.setServers(["8.8.8.8", "8.8.4.4"])` using `node:dns`.
* **Rationale**: Node's internal `c-ares` DNS library on Windows often fails or gets refused (`ECONNREFUSED`) when querying SRV records (`_mongodb._tcp...`) through residential router/ISP DNS proxies (e.g. Airtel/Jio Fiber). Setting Google Public DNS directly in Node resolves MongoDB Atlas SRV hosts reliably.

#### 2. ES Module Dotenv Hoisting
* **File Modified**: `server/index.js`
* **Change**: Replaced `dotenv.config()` after imports with `import "dotenv/config";` at line 1.
* **Rationale**: In ES Modules, static `import` declarations are evaluated before the module body runs. Using `import "dotenv/config"` ensures all environment variables in `.env` are injected before any downstream imports evaluate.

---

### [2026-10-20] - Firebase Client Configuration
* **File Modified**: `client/src/utils/firebase.js`
* **Change**: Initialized Firebase app using valid project credentials (`ai-interviewer-55ca1`) and exported `auth` and `provider` for Google Sign-In.
* **Rationale**: Required for Google OAuth authentication flow in `client/src/pages/Auth.jsx`.

---

### [2026-10-20] - User Controller Query Formatting
* **File Modified**: `server/controllers/user.controller.js`
* **Change**: Cleaned up syntax and response formatting for `getCurrentUser`.
* **Rationale**: Ensure consistent error and response handling when verifying the active JWT session on page refresh.

---

### [2026-10-21] - Interview Controller Cleanup

#### 1. Removed Redundant `question.score = 0` Assignments
* **File Modified**: `server/controllers/interview.controller.js` (Lines 235, 248)
* **Change**: Commented out `question.score = 0` in the "no answer" and "time exceeded" handlers inside `submitAnswer`.
* **Rationale**: The `questionsSchema` in `server/models/interview.model.js` already defines `score: { type: Number, default: 0 }`. Since the score is never modified before these checks, explicitly setting it to `0` is redundant.

#### 2. Fixed Error Logging: `${error}` → `${error.message}`
* **File Modified**: `server/controllers/interview.controller.js` (Line 331)
* **Change**: Changed `${error}` to `${error.message}` in the `submitAnswer` catch block.
* **Rationale**: Using raw `${error}` in a template literal calls `.toString()`, producing a redundant `"Error: ..."` prefix. Using `${error.message}` extracts only the clean message string. Also prevents `[object Object]` output if the caught error is not a standard `Error` instance.

#### 3. Added Guard Check for Empty Questions in `finishInterview`
* **File Modified**: `server/controllers/interview.controller.js` (Lines 345–362)
* **Change**: Added early return `400` status check if `!interview.questions || interview.questions.length === 0`. Replaced redundant ternary checks (`totalQuestions ? total / totalQuestions : 0`) with direct division.
* **Rationale**: An interview with 0 questions represents an invalid or corrupted state. Completing it with artificial 0 scores and marking it "completed" hides upstream errors. Failing early ensures data integrity and simplifies calculation code.

#### 4. Persisted Average Metrics to Schema & Optimized `getInterviewReport` to $O(1)$
* **Files Modified**: `server/models/interview.model.js` (Lines 41–44), `server/controllers/interview.controller.js` (Lines 368–440)
* **Change**: 
  1. Added `confidence`, `communication`, and `correctness` fields directly to `interviewSchema` with default `0`.
  2. In `finishInterview`, saved the computed average metrics into MongoDB alongside `finalScore`.
  3. In `getInterviewReport`, eliminated the redundant `interview.questions.forEach` loop and arithmetic divisions, returning the pre-calculated metrics directly.
* **Rationale**: The read-to-write ratio for reports heavily favors reads. Persisting computed averages once on completion shifts work from $O(N)$ repeated calculations on every report load/reload to an instant $O(1)$ read, reducing server CPU overhead and network payload.

---

### [2026-10-24] - Concurrent Interview Race Condition & Lost Update Fix

#### 1. Atomic Credit Deduction & Refund Safety
* **File Modified**: `server/controllers/interview.controller.js` (Lines 97–115, 175–225)
* **Change**: Replaced `User.findById` and in-memory credit deduction with atomic `User.findOneAndUpdate({ _id, credits: { $gte: 50 } }, { $inc: { credits: -50 } })` before triggering external AI calls. Added automatic credit refund fallbacks (`$inc: { credits: 50 }`) in catch blocks and AI error paths.
* **Rationale**: Prevents Time-of-Check to Time-of-Use (TOCTOU) race conditions and "Lost Updates" where simultaneous requests in multiple browser tabs granted multiple interviews for a single 50-credit balance.

#### 2. Active Interview Concurrency Mutex
* **File Modified**: `server/controllers/interview.controller.js` (Lines 94–106)
* **Change**: Added pre-flight check `Interview.findOne({ userId, status: "Incompleted" })`. Returns `400 Bad Request` if an ongoing session already exists.
* **Rationale**: Prevents users from simultaneously running and multitasking multiple interviews under the same account.


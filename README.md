# AI Interviewer (InterviewIQ.AI)

InterviewIQ.AI is a web app for practicing job interviews. Choose a role, experience level, and interview mode to get AI-generated questions. Answer under a time limit, review feedback on each answer, and download a PDF report at the end.

## Features

- Practice technical or HR interviews tailored to your target role and experience.
- Optionally upload a text-based PDF résumé (up to 5 MB) to tailor questions to your skills and projects. The app sends extracted résumé text to OpenRouter for analysis.
- Type your answers or dictate them in a browser with speech recognition. The interviewer reads questions and feedback aloud when speech synthesis is available.
- Review past interviews, see scores for correctness, communication, and confidence, and export reports as PDFs.
- Sign in with Google and purchase interview credits through Razorpay.

## Tech stack

- **Client** — React, Vite, Tailwind CSS, Redux Toolkit, React Router, and Firebase Authentication
- **Server** — Node.js, Express, MongoDB with Mongoose, and JWT sessions
- **Integrations** — OpenRouter (`openai/gpt-4o-mini`) for questions and feedback, Razorpay for payments, and jsPDF for report export

## Run locally

You'll need Node.js 22.12 or newer, npm, a MongoDB connection, an OpenRouter API key, and Razorpay test credentials.

```bash
git clone https://github.com/ashishpandey999093-star/AI-Interviewer.git
cd AI-Interviewer
npm ci --prefix server
npm ci --prefix client
```

Create `server/.env` with these values, replacing the placeholders with your own credentials. The client expects the API on port `8000`, so set `PORT` explicitly.

```dotenv
PORT=8000
MONGODB_URL=mongodb://127.0.0.1:27017/interviewiq
JWT_SECRET=replace-with-a-long-random-secret
OPENROUTER_API_KEY=replace-with-your-openrouter-key
RAZORPAY_KEY_ID=replace-with-your-razorpay-test-key-id
RAZORPAY_KEY_SECRET=replace-with-your-razorpay-test-key-secret
```

The MongoDB URI above assumes a local MongoDB instance. For MongoDB Atlas, use your Atlas connection string. Razorpay initializes at server startup, so supply the test credentials even if you only plan to try the interviews.

Create `client/.env` with the matching Razorpay test key ID.

```dotenv
VITE_RAZORPAY_KEY_ID=replace-with-your-razorpay-test-key-id
```

The Firebase web configuration lives in [`client/src/utils/firebase.js`](client/src/utils/firebase.js). To use your own Firebase project, replace that configuration, enable Google sign-in, and add `localhost` to the project's authorized domains.

From the repository root, open two terminals and start one process in each.

```bash
npm run dev --prefix server
```

```bash
npm run dev --prefix client -- --strictPort
```

Open [http://localhost:5173](http://localhost:5173). The API allows that exact client origin. Sign in with Google, choose **Start Interview**, and select a role, experience level, and mode. Allow microphone access if you want to dictate answers.

## Troubleshooting

- **Vite cannot resolve `./pages/auth`** — On case-sensitive file systems, change that import in [`client/src/App.jsx`](client/src/App.jsx) to `./pages/Auth` to match the filename.
- **Requests fail or the browser reports a CORS error** — Check that the app is at `http://localhost:5173` and the API is running on port `8000`.
- **Dictation is unavailable** — Check microphone permissions and browser speech-recognition support. You can also type your answers.

## Project structure

| Path | Contents |
| --- | --- |
| [`client/`](client/) | Interview setup, live interview, reports, history, and checkout |
| [`server/`](server/) | Authentication, interview and payment APIs, MongoDB models, and service integrations |

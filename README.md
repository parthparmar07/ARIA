# Insightful Coach (ARIA)

Insightful Coach is an AI-powered mock interview and career preparation platform. At its core, the platform uses an orchestrator of intelligent agents (dubbed ARIA) to dynamically adapt to a user's background, role, and real-time performance.

## Setup and Run Instructions

This project requires both a Node.js environment for the React frontend (Vite) and a Python environment for the FastAPI backend.

### 1. Backend Setup (FastAPI)

Navigate to the backend directory, install the dependencies, and run the server.

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the Uvicorn server
python -m uvicorn main:app --reload
```
*Note: Ensure you have your `GROQ_API_KEY` defined in a `.env` file within the `backend` directory.*

### 2. Frontend Setup (React/Vite)

In a new terminal, navigate to the root directory, install dependencies, and run the frontend.

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Architecture Overview

The system is built on a modular Agent Orchestration framework. Instead of a single LLM handling the entire interview, we split the responsibilities across specialized AI agents.

### The Agent Orchestrator
The `AgentOrchestrator` (`backend/orchestrator.py`) is the brain of the backend. It maintains the `SessionState` and routes data between the various agents. When an answer is submitted, the Orchestrator passes it to the Evaluator, records the scores, and then queries the Interviewer for the next question based on the cumulative context.

### The Agents
1. **Interviewer Agent (`interviewer_agent.py`)**
   - **Role:** Generates the next question.
   - **Mechanism:** Takes the user's background, the target role, and the interview focus (e.g., system design, behavioral). It reviews the history of questions already asked and dynamically scales the difficulty up or down based on the candidate's previous performance.
   
2. **Evaluator Agent (`evaluator_agent.py`)**
   - **Role:** Grades the candidate's answers.
   - **Mechanism:** Analyzes the submitted text against strict rubrics (Clarity, Relevance, Depth, Evidence, Communication) and produces a JSON-structured evaluation. It highlights red flags and provides constructive feedback.

3. **Coach Agent (`coach_agent.py`)**
   - **Role:** Generates a comprehensive post-interview report.
   - **Mechanism:** After a session concludes, the Orchestrator passes the entire session trace to the Coach. The Coach identifies macroscopic patterns (e.g., "always uses the STAR method but lacks technical depth") and formulates an actionable study plan.

4. **Pipeline / Document Agents**
   - Agents for parsing resumes, extracting structured JSON schema data, and guiding the user through custom "Interview Loops" mimicking real-world hiring pipelines.

---

## Key Design Decisions & Tradeoffs

1. **Multi-Agent over Monolithic LLM**
   - *Decision:* Split the evaluation and questioning into distinct prompts and LLM calls.
   - *Tradeoff:* Higher latency per turn (as it requires sequential inference steps) but significantly higher quality, as the Evaluator can be hyper-critical while the Interviewer remains conversational and adaptive.

2. **Groq Llama 3.1 8B Migration**
   - *Decision:* Replaced Anthropic Claude 3.5 Sonnet with `llama-3.1-8b-instant` via Groq.
   - *Tradeoff:* Extremely fast time-to-first-token (crucial for real-time WebSockets and UI responsiveness), though smaller models require more strict JSON-mode enforcement and rigorous prompt engineering to guarantee structured output.

3. **In-Memory vs Redis Session Store**
   - *Decision:* The session store (`session_store.py`) was simplified to an in-memory dictionary for streamlined local execution on Windows.
   - *Tradeoff:* This prevents horizontal scaling of the Uvicorn workers, but heavily simplifies local setup by removing the Redis dependency.

4. **WebSockets for Voice**
   - *Decision:* Implemented `useVoiceWS` to bypass the inconsistent browser-native `SpeechRecognition` API.
   - *Tradeoff:* Requires an active, stable backend connection to stream audio to a Whisper model, but guarantees uniform transcription quality across all browsers (including Firefox and Safari).

---

## Example Transcripts

### Example 1: Strong Candidate (Behavioral)
**Question (ARIA):** Tell me about a time you had to deal with an underperforming team member. How did you handle it?
**Candidate:** "In my last role, a junior developer was constantly missing sprint deadlines. Instead of escalating immediately, I set up a 1-on-1. I discovered they were struggling with our new CI/CD pipeline. I paired with them for an hour each day for a week to upskill them, and they ended up becoming our primary deployment lead."
**Evaluation:** 
- *Score:* 9.2/10
- *Feedback:* Excellent use of the STAR method. Demonstrated empathy, root-cause analysis, and leadership without direct authority.
- *Next Question (Adaptive - Harder):* "How do you balance that hands-on mentorship with your own deliverables during a critical product launch?"

### Example 2: Weak Candidate (Technical)
**Question (ARIA):** How would you design a rate limiter for a distributed API?
**Candidate:** "I would use a database and just check how many requests the user made in the last minute. If it's too high, I'll block them."
**Evaluation:** 
- *Score:* 3.5/10
- *Feedback:* Lacks system design depth. Fails to mention race conditions, distributed state (like Redis), or standard algorithms like Token Bucket or Leaky Bucket.
- *Next Question (Adaptive - Clarifying/Easier):* "Let's explore that database approach. If you have 10,000 requests per second across 5 different API servers, how does your database handle the concurrent reads and writes for that count?"

### Example 3: Tricky/Edge Case (System Design)
**Question (ARIA):** You are tasked with migrating a monolithic SQL database to a microservices architecture with minimal downtime. Where do you start?
**Candidate:** "I wouldn't do it. Microservices add too much operational overhead. I'd just scale the monolith vertically and add read replicas."
**Evaluation:** 
- *Score:* 7.0/10
- *Feedback:* Bold and practical stance, showing real-world operational awareness. However, it sidesteps the prompt's constraint ("You are tasked with...").
- *Next Question (Adaptive - Challenging the constraint):* "While vertical scaling is a highly pragmatic first step, let's assume the business has acquired three other companies and the schema collisions are blocking deployment. You *must* break it apart. What is your migration strategy?"

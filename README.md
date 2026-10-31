# Indigo.ai — Intelligent AI Workspace

Indigo.ai is an AI-powered conversational workspace that analyzes user messages, identifies their intent and risk level, and generates context-aware responses using Large Language Models (LLMs).

The application combines a React frontend, FastAPI backend, Groq-powered AI processing, and PostgreSQL database to provide an interactive chat experience with conversation history.

## Project Overview

Indigo.ai aims to make message understanding and response generation easier through AI-powered intent detection and contextual conversations.

Users can enter messages and receive structured analysis along with AI-generated Markdown responses.

## Key Features

- **AI-powered message analysis:** Identifies the intent behind user messages.
- **Risk classification:** Categorizes messages based on risk levels.
- **Priority detection:** Determines the priority of analyzed messages.
- **Context-aware responses:** Generates responses using previous conversation history.
- **Markdown rendering:** Displays AI responses in readable Markdown format.
- **Conversation management:** Creates and stores conversations.
- **Persistent history:** Retrieves previous conversations and messages.
- **Token estimation:** Provides estimated input token metadata.
- **Responsive interface:** Modern chat interface with light and dark themes.

## Weekly Learning Outcomes

### Week 1 — LLM APIs and Structured Outputs
- Explored LLM API integration.
- Worked with Groq API.
- Learned Pydantic models and data validation.
- Implemented structured output generation.
- Used Instructor for structured LLM responses.

### Week 2 — LLM Integration and Response Generation
- Integrated the backend with an LLM API.
- Implemented context-aware response generation.
- Worked with prompt templates and conversation context.
- Integrated React Markdown rendering.

### Week 3 — Backend and Database Integration
- Developed backend APIs using FastAPI.
- Integrated PostgreSQL database.
- Implemented conversation and message storage.
- Added conversation history retrieval.
- Connected frontend and backend.

### Week 4 — Deployment and Production Integration
- Deployed the backend using Render.
- Deployed the frontend using Vercel.
- Configured production environment variables.
- Integrated frontend and backend deployment URLs.
- Configured CORS for production communication.
- Tested AI responses and conversation history in the deployed application.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript, CSS |
| Build Tool | Vite |
| Backend | Python, FastAPI |
| LLM Provider | Groq |
| Structured Outputs | Instructor, Pydantic |
| Database | Supabase PostgreSQL |
| Markdown | React Markdown |
| Token Estimation | tiktoken |
| Backend Deployment | Render |
| Frontend Deployment | Vercel |
| Version Control | Git, GitHub |

## System Architecture

1. User enters a message through the React frontend.
2. The frontend sends the request to the FastAPI backend.
3. The backend validates the input using Pydantic.
4. The AI service analyzes the message and identifies its intent, risk profile, and priority.
5. Groq generates a context-aware response using conversation history.
6. Conversation messages are stored in PostgreSQL.
7. The backend returns the analysis and Markdown response.
8. The React frontend displays the response to the user.

## Project Structure

```text
Ai-Engineer-workshop-sync/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── schemas/
│   │   │   └── ingestion.py
│   │   └── services/
│   │       ├── database_service.py
│   │       └── llm_service.py
│   ├── requirements.txt
│   └── .env
│
├── frontend-react-js/
│   ├── src/
│   │   ├── App.jsx
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

## Local Setup

### Prerequisites
- Python 3.10 or later
- Node.js and npm
- PostgreSQL database
- Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/Manasa-Pandranki/Ai-Engineer-workshop.git
cd Ai-Engineer-workshop
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
DATABASE_URL=your_postgresql_connection_string
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend runs at:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend-react-js
npm install
```

Create a `.env` file in the frontend folder:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Backend health check |
| GET | `/api/conversations` | Retrieve conversations |
| GET | `/api/conversations/{session_id}/messages` | Retrieve conversation messages |
| POST | `/api/analyze` | Analyze a message and generate an AI response |

## Live Deployment

- **Frontend:** https://ai-engineer-workshop-five.vercel.app/
- **Backend:** https://enterprise-ingestion-firewall-api.onrender.com/
- **Health Check:** https://enterprise-ingestion-firewall-api.onrender.com/health

## Environment Variables

The application requires the following environment variables:

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Groq API authentication |
| `GROQ_MODEL` | LLM model selection |
| `DATABASE_URL` | PostgreSQL connection |
| `VITE_API_URL` | Backend API URL for the frontend |

**Important:** Never upload API keys, database credentials, or `.env` files containing secrets to GitHub.

## Future Enhancements

- User authentication and personalized chat history.
- Improved conversation search.
- Additional AI models and provider support.
- Advanced analytics and reporting.
- Enhanced error handling and monitoring.

## Author

**Manasa Pandranki**

B.Tech — Artificial Intelligence and Data Science

## Acknowledgement

Developed as part of the **Pro Hire Networks AI Practical Guidance Program**, covering LLM integration, structured outputs, backend development, database integration, and deployment.

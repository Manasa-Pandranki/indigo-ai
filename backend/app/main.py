from fastapi import FastAPI, HTTPException
from threading import Lock
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.schemas.ingestion import IngestionRequest, IngestionResult
from app.services.llm_service import (
    analyze_message,
    generate_contextual_response,
)
from app.utils.token_counter import estimate_tokens

app = FastAPI(
    title="Enterprise Structured Ingestion Firewall",
    description="Classifies user messages and generates contextual responses.",
    version="1.1.0",
)
# Temporary in-memory storage for chat sessions
chat_sessions: dict[str, list[dict[str, str]]] = {}

# Protect shared session storage from simultaneous updates
chat_sessions_lock = Lock()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Ingestion Firewall API is running",
    }


@app.post("/api/analyze")
def analyze(request: IngestionRequest):
    message = request.message.strip()
    session_id = request.session_id

    if not message:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty.",
        )

    try:
        # Step 1: Classify the current message.
        result = analyze_message(message)

        # Step 2: Get this session's previous conversation.
        with chat_sessions_lock:
            history = list(chat_sessions.get(session_id, []))

        # Step 3: Generate a response using previous history.
        answer = generate_contextual_response(
            message=message,
            intent=result.intent,
            summary=result.summary,
            chat_history=history,
        )

        # Step 4: Store the user message and AI response.
        with chat_sessions_lock:
            session_history = chat_sessions.setdefault(
                session_id, []
            )
            session_history.append({
                "role": "user",
                "content": message,
            })
            session_history.append({
                "role": "assistant",
                "content": answer,
            })

        # Step 5: Add token metadata.
        result.token_metadata.estimated_input_tokens = (
            estimate_tokens(message)
        )

        # Step 6: Return the response.
        return {
            **result.model_dump(),
            "session_id": session_id,
            "answer": answer,
        }

    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "error": (
                    "The model response did not pass schema validation."
                ),
                "validation_errors": exc.errors(),
            },
        ) from exc

    except Exception as exc:
        print(f"Analysis error: {exc}")
        raise HTTPException(
            status_code=502,
            detail=(
                "LLM request failed. Check the API key, model name, "
                "network, and provider limits."
            ),
        ) from exc
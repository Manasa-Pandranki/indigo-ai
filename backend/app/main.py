
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.schemas.ingestion import IngestionRequest
from app.services.llm_service import (
    analyze_message,
    generate_contextual_response,
)
from app.services.database_service import (
    initialize_database,
    get_chat_history,
    add_chat_message,
    list_conversations,
    get_conversation_messages,
)
from app.utils.token_counter import estimate_tokens


app = FastAPI(
    title="Enterprise Structured Ingestion Firewall",
    description="Classifies user messages and generates contextual responses.",
    version="1.1.0",
)


# Initialize Supabase PostgreSQL database on startup.
@app.on_event("startup")
def startup_event():
    initialize_database()


# Configure CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint.
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Ingestion Firewall API is running",
    }


# Analyze message and maintain conversation history.
@app.post("/api/analyze")
def analyze(request: IngestionRequest):
    message = request.message.strip()
    session_id = str(request.session_id or uuid4())

    if not message:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty.",
        )

    try:
        # Step 1: Classify the current message.
        result = analyze_message(message)

        # Step 2: Retrieve previous conversation from Supabase.
        history = get_chat_history(session_id)

        # Step 3: Generate a contextual response.
        answer = generate_contextual_response(
            message=message,
            intent=result.intent,
            summary=result.summary,
            chat_history=history,
        )

        # Step 4: Save user message and assistant response.
        add_chat_message(session_id, "user", message)
        add_chat_message(session_id, "assistant", answer)

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
                "Request failed. Check the database, API key, "
                "model name, and network."
            ),
        ) from exc


# Get the list of previous conversations.
@app.get("/api/conversations")
def get_conversations():
    try:
        return {
            "conversations": list_conversations()
        }

    except Exception as exc:
        print(f"Conversation list error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Could not load conversations.",
        ) from exc


# Get all messages from a selected conversation.
@app.get("/api/conversations/{session_id}")
def get_conversation(session_id: str):
    try:
        messages = get_conversation_messages(session_id)

        return {
            "session_id": session_id,
            "messages": messages,
        }

    except Exception as exc:
        print(f"Conversation history error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Could not load conversation history.",
        ) from exc

from fastapi import FastAPI, HTTPException
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

    if not message:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty.",
        )

    try:
        # Step 1: Classify the user's message.
        result = analyze_message(message)

        # Step 2: Generate a helpful response using the classification.
        answer = generate_contextual_response(
            message=message,
            intent=result.intent,
            summary=result.summary,
        )

        # Step 3: Add the estimated input token count.
        result.token_metadata.estimated_input_tokens = estimate_tokens(message)

        # Step 4: Return both the classification and generated answer.
        return {
            **result.model_dump(),
            "answer": answer,
        }

    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "error": "The model response did not pass schema validation.",
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

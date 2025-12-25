from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TopicRequest(BaseModel):
    topic: str

@app.get("/")
def read_root():
    return {"status": "Backend running"}

@app.post("/generate")
def generate_notes(data: TopicRequest):
    topic = data.topic

    # TEMP OUTPUT (AI comes later)
    notes = f"""
    THEORY:
    This is a placeholder explanation for {topic}.

    WORKED EXAMPLES:
    Example 1: Placeholder example for {topic}.
    Example 2: Another example for {topic}.

    PRACTICE QUESTIONS:
    1. Question one about {topic}.
    2. Question two about {topic}.
    3. Question three about {topic}.
    """

    return {"content": notes}

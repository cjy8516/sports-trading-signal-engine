from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter()

DATA_DIR = Path("data/replay")


@router.get("/")
def root():
    return {"status": "ok"}


@router.get("/api/replay")
def replay():
    file_path = DATA_DIR / "replay_txodds.jsonl"

    return StreamingResponse(
        open(file_path, "rb"),
        media_type="application/x-ndjson",
    )


@router.get("/api/signals")
def signals():
    file_path = DATA_DIR / "replay_signals.jsonl"

    return StreamingResponse(
        open(file_path, "rb"),
        media_type="application/x-ndjson",
    )
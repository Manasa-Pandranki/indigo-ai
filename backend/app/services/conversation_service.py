
from collections import defaultdict, deque
from threading import RLock

MAX_HISTORY_MESSAGES = 12

_history: dict[str, deque[dict[str, str]]] = defaultdict(
    lambda: deque(maxlen=MAX_HISTORY_MESSAGES)
)
_lock = RLock()


def get_history(session_id: str) -> list[dict[str, str]]:
    with _lock:
        return list(_history[session_id])


def add_message(session_id: str, role: str, content: str) -> None:
    if role not in ("user", "assistant"):
        raise ValueError("Conversation role must be user or assistant")

    with _lock:
        _history[session_id].append(
            {"role": role, "content": content}
        )


def clear_session(session_id: str) -> None:
    with _lock:
        _history.pop(session_id, None)

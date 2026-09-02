import json
import os

import socketio

sio = socketio.AsyncServer(
    cors_allowed_origins=json.loads(os.getenv("FRONT_END_ORIGINS", "[]")),
    async_mode="asgi",
)

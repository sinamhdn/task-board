from typing import Dict, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.channels: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        for channel in list(self.channels.keys()):
            self.channels[channel].discard(websocket)
            if not self.channels[channel]:
                del self.channels[channel]

    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_channel(self, channel: str, message: Dict):
        if channel in self.channels:
            for connection in self.active_connections:
                await connection.send_json(message)

    async def broadcast_global(self, message: Dict):
        for connection in self.active_connections:
            await connection.send_json(message)

    def subscribe(self, websocket: WebSocket, channel: str):
        if channel not in self.channels:
            self.channels[channel] = set()
        self.channels[channel].add(websocket)

    def unsubscribe(self, websocket: WebSocket, channel: str):
        if channel in self.channels:
            self.channels[channel].discard(websocket)
            if not self.channels[channel]:
                del self.channels[channel]

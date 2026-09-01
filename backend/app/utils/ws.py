from typing import Dict, Set

from fastapi import (
    WebSocket,
    status,
)

from ..crud.users import UserCRUD
from ..utils.auth import verify_access_token
from .db import AsyncSession


class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.channels: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        await self.send_personal_message(
            {
                "field": "ws_notif",
                "msg": "Connection opened, subscribe to a channel.",
            },
            websocket,
        )
        # if any(websocket in connections for connections in self.channels.values()):

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        for channel in list(self.channels.keys()):
            self.channels[channel].discard(websocket)
            if not self.channels[channel]:
                del self.channels[channel]

    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_channel(
        self, websocket: WebSocket, channel: str, message: Dict
    ):
        if not self.is_subscribed(websocket, channel):
            await self.send_personal_message(
                {
                    "field": "ws_notif",
                    "msg": f"You are not subscribed to {channel}.",
                },
                websocket,
            )
            return
        for connection in self.channels[channel]:
            await connection.send_json(message)
        # if channel in self.channels:
        #     for connection in self.channels[channel]:
        #         await connection.send_json(message)

    async def broadcast_global(self, message: Dict):
        for connection in self.active_connections:
            await connection.send_json(message)

    def subscribe(self, websocket: WebSocket, channel: str):
        if channel not in self.channels:
            self.channels[channel] = set()
        self.channels[channel].add(websocket)

    async def unsubscribe(self, websocket: WebSocket, channel: str):
        if not self.is_subscribed(websocket, channel):
            await self.send_personal_message(
                {
                    "type": "ws_notif",
                    "msg": f"You are not subscribed to {channel}.",
                },
                websocket,
            )
            return

        if channel in self.channels:
            self.channels[channel].discard(websocket)
            if not self.channels[channel]:
                del self.channels[channel]

    def is_subscribed(self, websocket: WebSocket, channel: str):
        return channel in self.channels and websocket in self.channels[channel]

    async def authenticateUser(self, websocket: WebSocket, session: AsyncSession):
        await self.connect(websocket)

        # we can also send token in the first message after connection which is more secure than query params
        # raw_data = await websocket.receive_text()
        # payload = json.loads(raw_data)
        # token = payload.get("token")

        token = websocket.query_params.get("access_token")

        if not token:  # handles None or empty string
            await websocket.send_json(
                {"field": "server_error", "msg": "Missing access token"}
            )
            self.disconnect(websocket)
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION, reason="Authentication Required."
            )
            return None

        user_id = verify_access_token(token)

        if not user_id:
            # await ws_manager.send_personal_message(
            #     {"field": "server_error", "msg": "Not Authenticated."}, websocket
            # )
            self.disconnect(websocket)
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION, reason="User not exists."
            )
            return None

        user = await UserCRUD.get_user_by_id(session, int(user_id))

        # ---DEBUGGING BLOCK---
        # print(f"RECIEVED USER {user_email}")
        # ---DEBUGGING BLOCK---
        return user


def send_boards_to_members(ws_manager: ConnectionManager, db: AsyncSession):
    pass

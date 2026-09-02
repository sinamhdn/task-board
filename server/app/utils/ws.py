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

    async def disconnect(
        self, websocket: WebSocket, close_status_code, close_reason: str
    ):
        self.active_connections.discard(websocket)
        for channel in list(self.channels.keys()):
            self.channels[channel].discard(websocket)
            if not self.channels[channel]:
                del self.channels[channel]
        await websocket.close(code=close_status_code, reason=close_reason)

    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        await websocket.send_json({"res_type": "Personal Message", "message": message})

    async def broadcast_channel(
        self, websocket: WebSocket | None, channel: str, message: Dict
    ):
        if websocket is not None and not self.is_subscribed(websocket, channel):
            await self.send_personal_message(
                {
                    "type": "ws_notif",
                    "msg": f"You are not subscribed to {channel}.",
                },
                websocket,
            )
            return
        if channel not in self.channels:
            return
        for connection in self.channels[channel]:
            await connection.send_json(
                {
                    "res_type": "broadcast_channel",
                    "channel": channel,
                    "message": message,
                }
            )
        # if channel in self.channels:
        #     for connection in self.channels[channel]:
        #         await connection.send_json(message)

    async def broadcast_global(self, message: Dict):
        for connection in self.active_connections:
            await connection.send_json(
                {"res_type": "broadcast_global", "message": message}
            )

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
            await self.send_personal_message(
                websocket=websocket,
                message={"type": "ws_error", "msg": "Missing access token"},
            )
            await self.disconnect(
                websocket=websocket,
                close_status_code=status.WS_1008_POLICY_VIOLATION,
                close_reason="Authentication Required.",
            )
            return None
        user_id = verify_access_token(token)
        if not user_id:
            # await ws_manager.send_personal_message(
            #     {"field": "server_error", "msg": "Not Authenticated."}, websocket
            # )
            await self.disconnect(
                websocket=websocket,
                close_status_code=status.WS_1008_POLICY_VIOLATION,
                close_reason="User not exists.",
            )
            return None
        user = await UserCRUD.get_user_by_id(session, int(user_id))
        # ---DEBUGGING BLOCK---
        # print(f"RECIEVED USER {user_email}")
        # ---DEBUGGING BLOCK---
        return user


class ClientConnectionManager:
    def __init__(self, websocket: WebSocket, manager: ConnectionManager):
        self.websocket = websocket
        self.manager = manager

    async def send_personal_message(self, message: Dict):
        await self.manager.send_personal_message(message, self.websocket)

    def subscribe(self, channel: str):
        self.manager.subscribe(self.websocket, channel)

    async def unsubscribe(self, channel: str):
        await self.manager.unsubscribe(self.websocket, channel)

    async def broadcast_channel(self, channel: str, message: Dict):
        await self.manager.broadcast_channel(self.websocket, channel, message)

    async def broadcast_global(self, message: Dict):
        await self.manager.broadcast_global(message)


manager = ConnectionManager()

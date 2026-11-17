import logging
from typing import Dict, Set

from fastapi import (
    WebSocket,
    WebSocketDisconnect,
    status,
)
from fastapi.websockets import WebSocketState

from ..crud.users import UserCRUD
from ..utils.auth import verify_access_token
from .db import AsyncSession

logger = logging.getLogger(name=f"websocket utilities logger: filename -> {__name__}")


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        self.channels: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        await self.send_personal_message(
            message={
                "type": "ws_notif",
                "msg": "Connection opened, subscribe to a channel.",
            },
            websocket=websocket,
        )
        # if any(websocket in connections for connections in self.channels.values()):

    async def disconnect(
        self,
        websocket: WebSocket,
        close_status_code: int = status.WS_1011_INTERNAL_ERROR,
        close_reason: str = "Internal server error.",
    ):
        try:
            if websocket.client_state != WebSocketState.DISCONNECTED:
                await websocket.close(code=close_status_code, reason=close_reason)
        except (RuntimeError, WebSocketDisconnect) as e:
            await self.send_personal_message(
                message={
                    "type": "ws_error",
                    "msg": f"Runtime error during disconnect: {e}.",
                },
                websocket=websocket,
            )
            logger.error(f"runtime error during disconnect: {e}")
        except Exception as e:
            await self.send_personal_message(
                message={
                    "type": "ws_error",
                    "msg": f"Error during disconnect: {e}.",
                },
                websocket=websocket,
            )
            logger.error(f"error during disconnect: {e}")

    def add_connection(self, websocket: WebSocket, user_id: int):
        # self.active_connections.setdefault(user_id, []).append(websocket)
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def remove_connection(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        for channel in list(self.channels.keys()):
            self.channels[channel].discard(websocket)
            if not self.channels[channel]:
                del self.channels[channel]

    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        try:
            if websocket.client_state != WebSocketState.CONNECTED:
                logger.error("attempted to send message to disconnected client")
                return False
            await websocket.send_json({"res": "personal_message", "message": message})
            return True
        except (WebSocketDisconnect, RuntimeError) as e:
            logger.info(
                f"client disconnected and runtime error during sending personal message: {e}"
            )
            return False
        except Exception as e:
            logger.error(f"error during sending personal message: {e}")
            return False

    async def broadcast_channel(
        self, websocket: WebSocket, channel: str, message: Dict, user_id: int
    ):
        if not self.is_subscribed(websocket, channel):
            await self.send_personal_message(
                {
                    "type": "ws_notif",
                    "msg": f"You are not subscribed to {channel}.",
                },
                websocket,
            )
            return
        # Create a copy of connections to avoid modification during iteration
        connections = list(self.channels.get(channel, set()))
        for connection in connections:
            try:
                await connection.send_json(
                    {
                        "res": "channel_broadcast",
                        "channel": channel,
                        "message": message,
                    }
                )
            except (WebSocketDisconnect, RuntimeError) as e:
                logger.info(
                    f"client disconnect and runtime error during channel broadcast: {e}"
                )
                # Remove dead connections
                self.remove_connection(
                    connection, user_id
                )  # You might need to track user_id here
                continue
        # if channel in self.channels:
        #     for connection in self.channels[channel]:
        #         await connection.send_json(message)

    async def broadcast_global(self, user_id: int, message: Dict):
        if not self.active_connections.get(user_id):
            return
        # Create a copy to avoid modification during iteration
        connections = list(self.active_connections.get(user_id, set()))
        for connection in connections:
            try:
                await connection.send_json(
                    {"res": "global_broadcast", "message": message}
                )
            except (WebSocketDisconnect, RuntimeError) as e:
                logger.info(
                    f"client disconnect and runtime error during global broadcast: {e}"
                )
                # Remove dead connections
                self.remove_connection(connection, user_id)

    async def subscribe(self, websocket: WebSocket, channel: str):
        try:
            if channel not in self.channels:
                self.channels[channel] = set()
            if websocket in self.channels[channel]:
                return
            self.channels[channel].add(websocket)
        except Exception as e:
            await self.send_personal_message(
                message={"type": "ws_notif", "msg": f"Error during subscription: {e}."},
                websocket=websocket,
            )
            logger.error(f"error during subscription: {e}")
        await self.send_personal_message(
            message={"type": "ws_notif", "msg": f"Subscribed to {channel}."},
            websocket=websocket,
        )

    async def unsubscribe(self, websocket: WebSocket, channel: str):
        if channel not in self.channels:
            await self.send_personal_message(
                {
                    "type": "ws_notif",
                    "msg": f"Channel {channel} does not exist.",
                },
                websocket,
            )
            return
        if websocket not in self.channels[channel]:
            await self.send_personal_message(
                {
                    "type": "ws_notif",
                    "msg": f"You are not subscribed to {channel}.",
                },
                websocket,
            )
            return
        self.channels[channel].discard(websocket)
        if not self.channels[channel]:
            del self.channels[channel]
        await self.send_personal_message(
            message={"type": "ws_notif", "msg": f"Unsubscribed from {channel}"},
            websocket=websocket,
        )

    def is_subscribed(self, websocket: WebSocket, channel: str):
        return channel in self.channels and websocket in self.channels[channel]

    async def connect_and_authenticate(
        self, websocket: WebSocket, session: AsyncSession
    ):
        await self.connect(websocket)
        # we can also send token in the first message after connection which is more secure than query params
        # raw_data = await websocket.receive_text()
        # payload = json.loads(raw_data)
        # token = payload.get("token")
        token = websocket.query_params.get("access_token")
        if not token:  # handles None or empty string
            await self.send_personal_message(
                websocket=websocket,
                message={"type": "ws_error", "msg": "Missing access token."},
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
        await self.manager.send_personal_message(
            websocket=self.websocket, message=message
        )

    async def broadcast_global(self, user_id: int, message: Dict):
        await self.manager.broadcast_global(message=message, user_id=user_id)

    async def broadcast_channel(self, channel: str, message: Dict, user_id: int):
        await self.manager.broadcast_channel(
            websocket=self.websocket, channel=channel, message=message, user_id=user_id
        )


manager = ConnectionManager()

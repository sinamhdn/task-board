import json
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    WebSocket,
    WebSocketDisconnect,
    WebSocketException,
    status,
)

from ..crud.users import UserCRUD
from ..schemas.ws import adapter
from ..utils.auth import verify_access_token
from ..utils.db import AsyncSession, get_async_db_session
from ..utils.ws import ConnectionManager

router = APIRouter(prefix="", tags=["ws"])
ws_manager = ConnectionManager()


# client side message examples
# {"action": "subscribe", "channel": "board:123"}
# {"action": "broadcast", "channel": "board:123", "message": "Hello everyone!"}
@router.websocket("")
async def socket(
    websocket: WebSocket,
    session: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    user = await ws_manager.authenticateUser(websocket=websocket, session=session)
    await ws_manager.connect(websocket)

    try:
        while True:
            try:
                payload = await websocket.receive_json()
                payload = adapter.validate_python(payload)

                # FOR TESTING
                await ws_manager.send_personal_message(payload, websocket)
                # FOR TESTING

                action = payload.get("action")
                channel = payload.get("channel")
                message = payload.get("message")

            except json.JSONDecodeError:
                # await ws_manager.send_personal_message(
                #     {"field": "server_error", "msg": "Invalid JSON format"}, websocket
                # )
                # continue
                raise WebSocketException(
                    status.HTTP_400_BAD_REQUEST, reason="Invalid JSON format."
                )

            if action == "subscribe":
                ws_manager.subscribe(websocket, channel)
                await ws_manager.send_personal_message(
                    {
                        "type": "server_notification",
                        "msg": f"Subscribed to channel: {channel}",
                    },
                    websocket,
                )
            elif action == "unsubscribe" and channel:
                await ws_manager.unsubscribe(websocket, channel)
                await ws_manager.send_personal_message(
                    {
                        "type": "server_notification",
                        "msg": f"Unsubscribed from channel: {channel}",
                    },
                    websocket,
                )
            elif action == "broadcast_channel" and channel and message:
                # Client wants to broadcast a message to a specific channel
                await ws_manager.broadcast_channel(
                    channel, {"sender": user, "content": message}
                )
            else:
                await ws_manager.send_personal_message(
                    {
                        "type": "server_notification",
                        "msg": "Unknown action or missing fields",
                    },
                    websocket,
                )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        print("WebSocket exception:", repr(e))
        ws_manager.disconnect(websocket)

import json
import logging
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    WebSocket,
    WebSocketDisconnect,
    WebSocketException,
    status,
)
from pydantic import ValidationError

from ..crud.users import UserCRUD
from ..schemas.ws import adapter
from ..utils.auth import verify_access_token
from ..utils.db import AsyncSession, get_async_db_session
from ..utils.ws import ClientConnectionManager, manager

router = APIRouter(prefix="", tags=["ws"])
logger = logging.getLogger("websocketapp")


# client side message examples
# {"action": "subscribe", "channel": "board:123"}
# {"action": "broadcast", "channel": "board:123", "message": "Hello everyone!"}
@router.websocket("")
async def socket(
    websocket: WebSocket,
    session: Annotated[AsyncSession, Depends(get_async_db_session)],
):
    # authenticate and connect websocket
    user = await manager.authenticateUser(websocket=websocket, session=session)
    client_manager = ClientConnectionManager(websocket=websocket, manager=manager)
    # If authentication failed, user will be None and connection is already closed
    # Stop execution
    if user is None:
        return
    try:
        while True:
            try:
                recieved_payload = await websocket.receive_json()
                payload_pydanthic = adapter.validate_python(recieved_payload)
                payload = payload_pydanthic.model_dump()
                # FOR TESTING
                await client_manager.send_personal_message(payload)
                # FOR TESTING
                action = payload.get("action")
                channel = payload.get("channel")
                message = payload.get("message")
            except json.JSONDecodeError as e:
                logger.info("invalid json format")
                await client_manager.send_personal_message(
                    message={
                        "type": "ws_error",
                        "msg": f"Invalid JSON format: {repr(e)}",
                    },
                )
                continue
            except ValidationError as e:
                logger.info("validation error")
                await client_manager.send_personal_message(
                    message={
                        "type": "ws_error",
                        "msg": f"Incorrect message format: {repr(e)}",
                    },
                )
                continue
            if action == "subscribe":
                client_manager.subscribe(channel=channel)
                await client_manager.send_personal_message(
                    {
                        "type": "ws_notif",
                        "msg": f"Subscribed to channel: {channel}",
                    },
                )
            elif action == "unsubscribe" and channel:
                await client_manager.unsubscribe(channel=channel)
                await client_manager.send_personal_message(
                    {
                        "type": "ws_notif",
                        "msg": f"Unsubscribed from channel: {channel}",
                    },
                )
            elif action == "broadcast_channel" and channel and message:
                # Client wants to broadcast a message to a specific channel
                await client_manager.broadcast_channel(
                    channel=channel,
                    message={"sender": user, "channel": channel, "content": message},
                )
            elif action == "broadcast_global":
                await client_manager.broadcast_global(message)
            else:
                await client_manager.send_personal_message(
                    message={
                        "type": "ws_notif",
                        "msg": "Unknown action or missing fields",
                    },
                )
    except WebSocketDisconnect:
        logger.info("Client disconnected")
        await client_manager.send_personal_message(
            message={"type": "ws_error", "msg": "Client disconnected."},
        )
        await manager.disconnect(
            websocket=websocket,
            close_status_code=status.WS_1005_NO_STATUS_RCVD,
            close_reason="Client disconnected.",
        )
    except Exception as e:
        logger.error(f"WebSocket exception: {repr(e)}")
        await client_manager.send_personal_message(
            message={"type": "ws_error", "msg": f"Error occurred: {repr(e)}"},
        )
        # Internal server error
        await manager.disconnect(
            websocket=websocket,
            close_status_code=status.WS_1005_NO_STATUS_RCVD,
            close_reason="Error occurred.",
        )
        raise WebSocketException(
            status.WS_1011_INTERNAL_ERROR, reason="Error occurred."
        )

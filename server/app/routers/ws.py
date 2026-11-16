import json
import logging
from typing import Annotated

from fastapi import (  # WebSocketException,; status,
    APIRouter,
    Depends,
    WebSocket,
    WebSocketDisconnect,
)
from pydantic import ValidationError

from ..schemas.ws import adapter
from ..utils.db import AnnotatedAsyncDBSession, AsyncSession, get_async_db_session
from ..utils.ws import manager

router = APIRouter(prefix="", tags=["ws"])
logger = logging.getLogger(f"websocket router logger: filename -> {__name__}")


# client side message examples
# {"action": "subscribe", "channel": "board:123"}
# {"action": "broadcast", "channel": "board:123", "message": "Hello everyone!"}
@router.websocket("")
async def socket(
    websocket: WebSocket,
    db: AnnotatedAsyncDBSession,
):
    # authenticate and connect websocket
    user = await manager.connect_and_authenticate(websocket, db)
    if user is None:
        return
    manager.add_connection(websocket=websocket, user_id=user.id)
    # If authentication failed, user will be None and connection is already closed
    # Stop execution
    try:
        while True:
            logger.info(
                f"is websocket connected websocket = {websocket} --- active_connections = {manager.active_connections} --- channels = {manager.channels}"
            )
            try:
                recieved_payload = await websocket.receive_json()
                payload_pydanthic = adapter.validate_python(recieved_payload)
                payload = payload_pydanthic.model_dump()
                # FOR TESTING
                await manager.send_personal_message(
                    websocket=websocket, message=payload
                )
                # FOR TESTING
                action = payload.get("action")
                channel = payload.get("channel")
                message = payload.get("message")
                if action == "subscribe":
                    await manager.subscribe(websocket=websocket, channel=channel)
                    await manager.send_personal_message(
                        websocket=websocket,
                        message={
                            "type": "ws_notif",
                            "msg": f"Subscribed to channel: {channel}",
                        },
                    )
                elif action == "unsubscribe" and channel:
                    await manager.unsubscribe(websocket=websocket, channel=channel)
                    await manager.send_personal_message(
                        websocket=websocket,
                        message={
                            "type": "ws_notif",
                            "msg": f"Unsubscribed from channel: {channel}",
                        },
                    )
                elif action == "broadcast_channel" and channel and message:
                    # Client wants to broadcast a message to a specific channel
                    await manager.broadcast_channel(
                        websocket=websocket,
                        channel=channel,
                        message={
                            "sender": user,
                            "channel": channel,
                            "content": message,
                        },
                        user_id=user.id,
                    )
                elif action == "broadcast_global":
                    await manager.broadcast_global(user_id=user.id, message=message)
                else:
                    await manager.send_personal_message(
                        websocket=websocket,
                        message={
                            "type": "ws_notif",
                            "msg": "Unknown action or missing fields",
                        },
                    )
            except json.JSONDecodeError as e:
                logger.error(f"invalid json format: {e}")
                await manager.send_personal_message(
                    websocket=websocket,
                    message={
                        "type": "ws_error",
                        "msg": f"Invalid JSON format: {repr(e)}",
                    },
                )
                continue
            except ValidationError as e:
                logger.error(f"validation error: {e}")
                await manager.send_personal_message(
                    websocket=websocket,
                    message={
                        "type": "ws_error",
                        "msg": f"Incorrect message format: {repr(e)}",
                    },
                )
                continue
    except WebSocketDisconnect as e:
        logger.info(f"client disconnected: {e}")
    except Exception as e:
        logger.error(f"websocket exception: {e}")
    finally:
        manager.remove_connection(
            websocket=websocket,
            user_id=user.id,
        )
        await manager.disconnect(websocket=websocket)

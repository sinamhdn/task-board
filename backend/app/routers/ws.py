import json

from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    WebSocketException,
    status,
)

from ..utils.auth import verify_access_token
from ..utils.ws import ConnectionManager

router = APIRouter(prefix="", tags=["ws"])
connection_manager = ConnectionManager()


# client side message examples
# {"action": "subscribe", "channel": "board:123"}
# {"action": "broadcast", "channel": "board:123", "message": "Hello everyone!"}
@router.websocket("")
async def socket(websocket: WebSocket):
    token = websocket.query_params.get("access_token")

    await connection_manager.connect(websocket)

    if not token:  # handles None or empty string
        # await websocket.send_json(
        #     {"field": "server_error", "msg": "Missing access token"}
        # )
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION, reason="Authentication Required."
        )
        return

    user = verify_access_token(token)

    print(f"RECIEVED TOKEN {token}")

    if not user:
        # await connection_manager.send_personal_message(
        #     {"field": "server_error", "msg": "Not Authenticated."}, websocket
        # )
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION, reason="User not exists."
        )
        return

    try:
        while True:
            try:
                payload = await websocket.receive_json()

                # FOR TESTING
                await connection_manager.send_personal_message(payload, websocket)
                # FOR TESTING

                action = payload.get("action")
                channel = payload.get("channel")
                message = payload.get("message")

            except json.JSONDecodeError:
                # await connection_manager.send_personal_message(
                #     {"field": "server_error", "msg": "Invalid JSON format"}, websocket
                # )
                # continue
                raise WebSocketException(
                    status.HTTP_400_BAD_REQUEST, reason="Invalid JSON format."
                )
            
            if action == "subscribe":
                connection_manager.subscribe(websocket, channel)
                await connection_manager.send_personal_message(
                    {
                        "field": "server_error",
                        "msg": f"Subscribed to channel: {channel}",
                    },
                    websocket,
                )
            elif action == "unsubscribe" and channel:
                connection_manager.unsubscribe(websocket, channel)
                await connection_manager.send_personal_message(
                    {
                        "field": "server_error",
                        "msg": f"Unsubscribed from channel: {channel}",
                    },
                    websocket,
                )
            elif action == "broadcast" and channel and message:
                # Client wants to broadcast a message to a specific channel
                await connection_manager.broadcast_channel(
                    channel, {"sender": "user", "content": message}
                )
            else:
                await connection_manager.send_personal_message(
                    {
                        "field": "server_error",
                        "msg": "Unknown action or missing fields",
                    },
                    websocket,
                )
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
    except Exception as e:
        print("WebSocket exception:", repr(e))
        connection_manager.disconnect(websocket)

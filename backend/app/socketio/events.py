from .server import sio


@sio.event
async def connect(sid, environ):
    print("🔌 Client connected:", sid)


@sio.event
async def disconnect(sid):
    print("❌ Client disconnected:", sid)


@sio.event
async def chat_message(sid, data):
    print(f"💬 {sid} says: {data}")

    await sio.emit("chat_message", {"sid": sid, "message": data})

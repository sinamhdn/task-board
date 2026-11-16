import logging

from .server import sio

logger = logging.getLogger(f"handlers logger: filename -> {__name__}")


@sio.event
async def connect(sid, environ):
    logger.info("🔌 client connected:", sid)


@sio.event
async def disconnect(sid):
    logger.info("❌ client disconnected:", sid)


@sio.event
async def chat_message(sid, data):
    logger.info(f"💬 {sid} says: {data}")

    await sio.emit("chat_message", {"sid": sid, "message": data})

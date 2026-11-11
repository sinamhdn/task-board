import uvicorn
from app.settings import settings  # adjust import path

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=int(settings.port),  # ← cast: uvicorn requires int
        reload=True,
    )

# if __name__ == "__main__":
#     uvicorn.run("app.main:socket_app", host="127.0.0.1", port=8000, reload=True)

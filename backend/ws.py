import asyncio
import json
import websockets
from websockets.asyncio.server import serve, ServerConnection
from backend.serializers import PaintLetterEvent
from redis_service import get_send_map_event, paint_letter

clients = set()


async def update_user_maps_job():
    map_data = get_send_map_event().model_dump_json()
    for client in clients:
        await client.send(map_data)


async def handle_connection(websocket: ServerConnection):
    clients.add(websocket)
    await websocket.send(get_send_map_event().model_dump_json())
    try:
        async for message in websocket:
            data = json.loads(message)
            if data["type"] == "paintLetter":
                paint_letter(PaintLetterEvent(**data))

    except (websockets.exceptions.ConnectionClosed, EOFError):
        print(f"Client disconnected: {websocket.remote_address}")
    finally:
        clients.remove(websocket)


async def start_ws():
    stop = asyncio.get_running_loop().create_future()
    async with serve(handle_connection, "0.0.0.0", 8765):
        print("Server started at ws://0.0.0.0:8765")
        await stop

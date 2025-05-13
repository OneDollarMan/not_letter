import json
import time
import redis
from config import REDIS_URL, MIN_X, MAX_X, MIN_Y, MAX_Y
from serializers import SendMapEvent, LetterPayload, PaintLetterEvent

r = redis.Redis.from_url(REDIS_URL)


def get_send_map_event() -> SendMapEvent:
    # start = time.time()
    keys = []
    for x in range(MIN_X, MAX_X + 1):
        for y in range(MIN_Y, MAX_Y + 1):
            redis_key = f"coordinates:{x}:{y}"
            keys.append(redis_key)

    values = r.mget(keys)

    res = []
    for i, value in enumerate(values):
        if value:
            x = MIN_X + (i // (MAX_Y - MIN_Y + 1))
            y = MIN_Y + (i % (MAX_Y - MIN_Y + 1))
            res.append(LetterPayload(x=x, y=y))
    # end = time.time()
    # print(f"[get_send_map_event] Elapsed: {round(end - start, 2)}s")
    return SendMapEvent(type='sendMap', payload=res)


def paint_letter(event: PaintLetterEvent):
    x = event.payload.x
    y = event.payload.y
    if MIN_X <= x <= MAX_X and MIN_Y <= y <= MAX_Y:
        redis_key = f"coordinates:{x}:{y}"
        r.set(redis_key, json.dumps({"x": x, "y": y}))

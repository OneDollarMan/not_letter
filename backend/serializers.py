from pydantic import BaseModel


class BaseEvent(BaseModel):
    type: str


class LetterPayload(BaseModel):
    x: int
    y: int


class PaintLetterEvent(BaseEvent):
    payload: LetterPayload


class SendMapEvent(BaseEvent):
    payload: list[LetterPayload]

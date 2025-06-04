from pydantic import BaseModel
from typing import List

class Point(BaseModel):
    name: str
    easting: float
    northing: float

class Segment(BaseModel):
    from_point: str
    to_point: str
    bearing: str
    distance: float

class BoundaryInput(BaseModel):
    points: List[Point]
    segments: List[Segment]

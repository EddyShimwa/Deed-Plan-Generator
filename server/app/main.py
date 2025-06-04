from typing import Union
from .schemas import BoundaryInput
from .utils import calculate_area_and_plot

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World Eddy Here"}


@app.post("/process-boundary")
def process_boundary(data: BoundaryInput):
    result = calculate_area_and_plot(data)
    return result
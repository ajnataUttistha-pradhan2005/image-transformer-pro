from pydantic import BaseModel
from typing import Optional

class ResizeOp(BaseModel):
    width: int
    height: int

class RotateOp(BaseModel):
    angle: float

class CannyOp(BaseModel):
    t1: int
    t2: int

class CropOp(BaseModel):
    left: int
    top: int
    right: int
    bottom: int

class Operations(BaseModel):
    resize: Optional[ResizeOp] = None
    rotate: Optional[RotateOp] = None
    flip: Optional[str] = None  # "horizontal", "vertical", "both"
    brightness: Optional[int] = 0  # offset from -100 to 100
    contrast: Optional[float] = 1.0  # multiplier, 1.0 is original
    grayscale: Optional[bool] = False
    blur: Optional[int] = 0  # exact kernel size e.g. 5
    sharpen: Optional[float] = 0.0  # multiplier e.g. 1.0
    canny: Optional[CannyOp] = None
    sobel: Optional[bool] = False
    crop: Optional[CropOp] = None

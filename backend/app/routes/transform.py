from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
import json
import cv2
import numpy as np
from app.models.schemas import Operations
from app.services.image_processing import process_image_pipeline

router = APIRouter()

@router.post("/process-image")
async def process_image(
    image: UploadFile = File(...),
    operations: str = Form(...)
):
    try:
        ops_dict = json.loads(operations)
        ops = Operations(**ops_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid operations JSON: {str(e)}")

    try:
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Could not decode image")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    try:
        processed_img = process_image_pipeline(img, ops)
        
        ext = image.filename.split('.')[-1].lower() if image.filename else 'jpg'
        encode_ext = '.png' if ext == 'png' else '.jpg'
        # ensure using correct color domain output depending on format
        
        success, encoded_img = cv2.imencode(encode_ext, processed_img)
        if not success:
            raise ValueError("Could not encode processed image")
            
        media_type = "image/png" if ext == 'png' else "image/jpeg"
        return Response(content=encoded_img.tobytes(), media_type=media_type)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

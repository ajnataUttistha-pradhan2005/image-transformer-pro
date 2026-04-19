from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.transform import router as transform_router

app = FastAPI(title="Image Transformer Pro API")

# Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transform_router)

@app.get("/")
def read_root():
    return {"message": "Image Transformer Pro API is running"}

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from predict import predict_image
from ingredient_ai import search_ingredient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "SkinSense AI Backend Running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = Image.open(file.file)
    result = predict_image(image)
    return result


# -----------------------------
# AI Ingredient Search
# -----------------------------

class IngredientRequest(BaseModel):
    query: str


@app.post("/ingredient-ai")
async def ingredient_ai(request: IngredientRequest):
    return search_ingredient(request.query)
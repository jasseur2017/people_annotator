import os
from pathlib import Path
import json
import base64
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from src.dao import DAO


app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dao = DAO(
    user=os.environ.get("POSTGRES_USER"),
    password=os.environ.get("POSTGRES_PASSWORD"),
    dbname=os.environ.get("POSTGRES_DB")
)

data_dir = Path(os.environ.get("DATA_DIR"))
config_file = Path(os.environ.get("CONFIG_FILE"))


@app.get("/get_configurations")
def getConfigurations():
    with open(config_file, "r") as f:
        data = json.load(f)
    return data


@app.get("/get_filenames")
def getFilenames():
    filenames = dao.getFilenames(k=10)
    return {"filenames": filenames}


@app.get("/get_image")
def getImage(image_name):
    file_path = Path(data_dir, image_name)
    assert file_path.is_file(), file_path
    with open(file_path, "rb") as f:
        encoded_image = base64.b64encode(f.read())
    annotations = dao.getAnnotations(image_name)
    return {
        "image_name": image_name, "image": encoded_image,
        "annotations": annotations
    }


@app.post("/save_annotations")
async def saveAnnotations(req: Request):
    data = await req.json()
    dao.updateAnnotations(data["image_name"], data["annotations"])

from fastapi import APIRouter
from ..nlp.extractor import extract_tasks
from ..schemas import TextInput

router = APIRouter(prefix="/extract", tags=["Extract"])

@router.post("/")
def extract(payload: TextInput):
    return extract_tasks(payload.text)

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TextAnalysisRequest(BaseModel):
    text: str

class TextAnalysisResponse(BaseModel):
    summary: str
    sentiment: str  # "positive" | "negative" | "neutral"
    positiveScore: int  # 0-100
    neutralScore: int   # 0-100
    negativeScore: int  # 0-100
    keywords: List[str]

class JobDocument(BaseModel):
    userId: str
    text: str
    status: str  # "pending" | "completed" | "failed"
    createdAt: datetime
    completedAt: Optional[datetime] = None
    result: Optional[TextAnalysisResponse] = None

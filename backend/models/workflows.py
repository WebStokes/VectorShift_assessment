from pydantic import BaseModel
from typing import List

class WorkflowRequest(BaseModel):
    nodes: List[dict]
    edges: List[dict]
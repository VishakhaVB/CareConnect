from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DonationReceiptResponse(BaseModel):
    id: int
    donation_id: int
    receipt_number: str
    receipt_file: str | None
    issued_at: datetime

    model_config = ConfigDict(from_attributes=True)

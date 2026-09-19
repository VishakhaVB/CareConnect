from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class DonationCreate(BaseModel):
    orphanage_id: int
    request_id: int | None = None
    donation_type: Literal["money", "item"]
    amount: Decimal | None = Field(None, gt=0)
    item_description: str | None = None
    quantity: int | None = Field(None, gt=0)

    @model_validator(mode="after")
    def validate_type_fields(self):
        if self.donation_type == "money":
            if self.amount is None or self.amount <= 0:
                raise ValueError("Amount is required and must be greater than 0 for money donations.")
        elif self.donation_type == "item":
            if not self.item_description:
                raise ValueError("item_description is required for item donations.")
            if self.quantity is None or self.quantity <= 0:
                raise ValueError("quantity is required and must be greater than 0 for item donations.")
        return self


class DonationStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1, max_length=30)


class DonationResponse(BaseModel):
    id: int
    donor_id: int
    orphanage_id: int
    request_id: int | None
    donation_type: str
    amount: Decimal | None
    item_description: str | None
    quantity: int | None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

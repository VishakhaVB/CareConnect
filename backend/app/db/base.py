from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.models.user import User
from app.models.orphanage import Orphanage
from app.models.volunteer import Volunteer
from app.models.request import ItemRequest
from app.models.donation import Donation
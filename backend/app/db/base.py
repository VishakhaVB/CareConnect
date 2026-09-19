from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.models.user import User
from app.models.orphanage import Orphanage
from app.models.volunteer import Volunteer
from app.models.request import ItemRequest
from app.models.donation import Donation
from app.models.donation_receipt import DonationReceipt
from app.models.event import Event
from app.models.event_participation import EventParticipation
from app.models.review import Review
from app.models.impact_story import ImpactStory
from app.models.notification import Notification
from app.models.badge import Badge
from app.models.user_badge import UserBadge
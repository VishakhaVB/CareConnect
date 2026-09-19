from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User


def register_user(
    db: Session,
    name: str,
    email: str,
    password: str,
    role: str,
):
    normalized_email = email.lower().strip()
    existing_user = db.query(User).filter(User.email == normalized_email).first()

    if existing_user:
        return None

    user = User(
        name=name.strip(),
        email=normalized_email,
        password_hash=hash_password(password),
        role=role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
):
    normalized_email = email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def login_user(db: Session, email: str, password: str):
    user = authenticate_user(db, email, password)

    if not user:
        return None

    token = create_access_token(user.id)

    return token
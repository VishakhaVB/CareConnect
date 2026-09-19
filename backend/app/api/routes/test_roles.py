from fastapi import APIRouter, Depends

from app.core.security import require_role
from app.models.user import User


router = APIRouter(
    prefix="/test",
    tags=["Role Testing"],
)


@router.get("/donor")
def donor_test(
    current_user: User = Depends(require_role("donor", "both")),
):
    return {
        "message": "Donor access granted",
        "user": current_user.name,
        "role": current_user.role,
    }


@router.get("/volunteer")
def volunteer_test(
    current_user: User = Depends(require_role("volunteer", "both")),
):
    return {
        "message": "Volunteer access granted",
        "user": current_user.name,
        "role": current_user.role,
    }


@router.get("/admin")
def admin_test(
    current_user: User = Depends(require_role("admin")),
):
    return {
        "message": "Admin access granted",
        "user": current_user.name,
        "role": current_user.role,
    }
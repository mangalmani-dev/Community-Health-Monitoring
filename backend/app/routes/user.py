from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user import User

from app.schemas.user import UserCreate, UserResponse
# Note: abhi User schema create nahi kiya hai


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    new_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password_hash=user.password,
        role=user.role,
        village_id=user.village_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timezone
from app.models.user import (
    User,
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin,
)
from loguru import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: UserCreate, admin: User = Depends(get_current_admin)):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role=data.role,
    )
    await user.insert()
    logger.info(f"User registered: {data.email}")
    return UserResponse.from_doc(user)


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Support login by email OR username
    user = await User.find_one(User.email == form_data.username)
    if not user:
        user = await User.find_one(User.username == form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    token = create_access_token(data={"sub": user.email or user.username, "role": user.role})
    logger.info(f"User logged in: {user.username or user.email}")
    return TokenResponse(
        access_token=token,
        user=UserResponse.from_doc(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_doc(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    full_name: str = None,
    current_user: User = Depends(get_current_user),
):
    if full_name:
        current_user.full_name = full_name
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()
    return UserResponse.from_doc(current_user)

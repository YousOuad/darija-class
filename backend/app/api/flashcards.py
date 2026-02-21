"""Flashcard routes: personal deck CRUD, explore, and copy."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.flashcard import Flashcard
from app.models.user import User
from app.schemas.flashcard import DeckResponse, FlashcardCreate, FlashcardResponse

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


def _card_to_response(card: Flashcard, owner_name: str = "") -> FlashcardResponse:
    return FlashcardResponse(
        id=card.id,
        front_arabic=card.front_arabic,
        front_latin=card.front_latin,
        back=card.back,
        is_public=card.is_public,
        created_at=card.created_at,
        owner_name=owner_name,
    )


@router.get("/my-deck", response_model=List[FlashcardResponse])
async def get_my_deck(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get all flashcards belonging to the current user."""
    result = await db.execute(
        select(Flashcard)
        .where(Flashcard.user_id == current_user.id)
        .order_by(Flashcard.created_at.desc())
    )
    cards = result.scalars().all()
    return [_card_to_response(c, current_user.display_name) for c in cards]


@router.post("", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    payload: FlashcardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new flashcard in the current user's deck."""
    card = Flashcard(
        user_id=current_user.id,
        front_arabic=payload.front_arabic,
        front_latin=payload.front_latin,
        back=payload.back,
        is_public=payload.is_public,
    )
    db.add(card)
    await db.flush()
    await db.refresh(card)
    return _card_to_response(card, current_user.display_name)


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flashcard(
    card_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a flashcard from the current user's deck."""
    result = await db.execute(
        select(Flashcard).where(
            Flashcard.id == card_id, Flashcard.user_id == current_user.id
        )
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found or not owned by you",
        )
    await db.delete(card)


@router.get("/suggestions", response_model=List[FlashcardResponse])
async def get_suggestions(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get random public flashcards from other users."""
    result = await db.execute(
        select(Flashcard, User.display_name)
        .join(User, Flashcard.user_id == User.id)
        .where(Flashcard.user_id != current_user.id, Flashcard.is_public.is_(True))
        .order_by(func.random())
        .limit(10)
    )
    rows = result.all()
    return [_card_to_response(card, name) for card, name in rows]


@router.get("/explore", response_model=List[DeckResponse])
async def explore_decks(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Browse other students' public decks."""
    # Find users who have public flashcards (exclude current user)
    user_result = await db.execute(
        select(User.id, User.display_name)
        .join(Flashcard, Flashcard.user_id == User.id)
        .where(Flashcard.user_id != current_user.id, Flashcard.is_public.is_(True))
        .group_by(User.id, User.display_name)
        .limit(20)
    )
    users = user_result.all()

    decks = []
    for user_id, display_name in users:
        cards_result = await db.execute(
            select(Flashcard)
            .where(Flashcard.user_id == user_id, Flashcard.is_public.is_(True))
            .order_by(Flashcard.created_at.desc())
            .limit(50)
        )
        cards = cards_result.scalars().all()
        decks.append(
            DeckResponse(
                user_id=user_id,
                display_name=display_name,
                card_count=len(cards),
                cards=[_card_to_response(c, display_name) for c in cards],
            )
        )

    return decks


@router.post("/{card_id}/copy", response_model=FlashcardResponse)
async def copy_flashcard(
    card_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Copy another user's flashcard to the current user's deck."""
    result = await db.execute(
        select(Flashcard).where(Flashcard.id == card_id, Flashcard.is_public.is_(True))
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found or not public",
        )

    copy = Flashcard(
        user_id=current_user.id,
        front_arabic=source.front_arabic,
        front_latin=source.front_latin,
        back=source.back,
        is_public=True,
    )
    db.add(copy)
    await db.flush()
    await db.refresh(copy)
    return _card_to_response(copy, current_user.display_name)

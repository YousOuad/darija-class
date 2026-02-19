"""Leaderboard routes."""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.progress import LeaderboardEntry
from app.models.user import User
from app.schemas.progress import LeaderboardResponse, LeaderboardUserEntry

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/", response_model=LeaderboardResponse)
async def get_leaderboard(
    period: str = Query("weekly", description="Period: weekly, monthly, all-time"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the leaderboard for the given period.

    Falls back to computing a live ranking from user XP if no
    pre-computed leaderboard entries exist for the requested period.
    """
    valid_periods = {"weekly", "monthly", "all-time"}
    if period not in valid_periods:
        period = "weekly"

    # Try pre-computed entries first
    result = await db.execute(
        select(LeaderboardEntry)
        .where(LeaderboardEntry.period == period)
        .order_by(LeaderboardEntry.rank.asc())
        .limit(50)
    )
    entries = list(result.scalars().all())

    user_rank: Optional[int] = None

    if entries:
        response_entries = []
        for entry in entries:
            # Fetch display name
            user_result = await db.execute(
                select(User.display_name).where(User.id == entry.user_id)
            )
            display_name = user_result.scalar() or "Unknown"
            response_entries.append(
                LeaderboardUserEntry(
                    user_id=entry.user_id,
                    display_name=display_name,
                    xp_total=entry.xp_total,
                    rank=entry.rank,
                )
            )
            if entry.user_id == current_user.id:
                user_rank = entry.rank
    else:
        # Fallback: live ranking from users table
        users_result = await db.execute(select(User).order_by(User.xp.desc()).limit(50))
        users = list(users_result.scalars().all())
        response_entries = []
        for idx, u in enumerate(users, start=1):
            response_entries.append(
                LeaderboardUserEntry(
                    user_id=u.id, display_name=u.display_name, xp_total=u.xp, rank=idx
                )
            )
            if u.id == current_user.id:
                user_rank = idx

    return LeaderboardResponse(
        period=period, entries=response_entries, user_rank=user_rank
    )

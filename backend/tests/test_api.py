"""API integration tests for DarijaLingo backend."""

import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
class TestHealthCheck:
    async def test_health_check(self, client: AsyncClient):
        """GET /api/health should return status ok."""
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "darijalingo-api"


# ---------------------------------------------------------------------------
# Auth Flow (end-to-end)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
class TestAuthFlow:
    async def test_register_and_login(self, client: AsyncClient):
        """Register a user, then login, then access /me."""
        # Register
        reg_response = await client.post(
            "/api/auth/register",
            json={
                "email": "flow@test.com",
                "password": "TestPass123",
                "display_name": "Flow Test",
            },
        )
        assert reg_response.status_code == 201
        tokens = reg_response.json()
        assert "access_token" in tokens
        assert "refresh_token" in tokens

        # Login with same credentials
        login_response = await client.post(
            "/api/auth/login",
            json={"email": "flow@test.com", "password": "TestPass123"},
        )
        assert login_response.status_code == 200
        login_tokens = login_response.json()
        assert "access_token" in login_tokens

        # Access protected route with the registration token
        me_response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert me_response.status_code == 200
        user = me_response.json()
        assert user["email"] == "flow@test.com"
        assert user["display_name"] == "Flow Test"
        assert user["level"] == "a2"
        assert user["xp"] == 0

    async def test_duplicate_email(self, client: AsyncClient):
        """Registering the same email twice should return 409."""
        payload = {
            "email": "dup@test.com",
            "password": "TestPass123",
            "display_name": "First",
        }
        first = await client.post("/api/auth/register", json=payload)
        assert first.status_code == 201

        dup = await client.post(
            "/api/auth/register",
            json={
                "email": "dup@test.com",
                "password": "TestPass123",
                "display_name": "Second",
            },
        )
        assert dup.status_code == 409

    async def test_wrong_password(self, client: AsyncClient):
        """Logging in with a wrong password should return 401."""
        await client.post(
            "/api/auth/register",
            json={
                "email": "wrong@test.com",
                "password": "TestPass123",
                "display_name": "Wrong",
            },
        )
        login = await client.post(
            "/api/auth/login",
            json={"email": "wrong@test.com", "password": "WrongPass1"},
        )
        assert login.status_code == 401

    async def test_protected_route_no_token(self, client: AsyncClient):
        """GET /me without a token should return 403."""
        response = await client.get("/api/auth/me")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Lessons
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
class TestLessons:
    async def test_list_lessons_empty(self, client: AsyncClient, auth_headers: dict):
        """Listing lessons when none exist should return an empty list."""
        response = await client.get("/api/lessons/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["lessons"] == []

    async def test_list_lessons_requires_auth(self, client: AsyncClient):
        """Listing lessons without auth should return 403."""
        response = await client.get("/api/lessons/")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Progress
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
class TestProgress:
    async def test_get_progress(self, client: AsyncClient, auth_headers: dict):
        """GET /progress/ should return initial progress summary."""
        response = await client.get("/api/progress/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_xp"] == 0
        assert data["current_level"] == "a2"
        assert data["total_lessons_completed"] == 0
        assert data["total_games_played"] == 0
        assert data["current_streak"] == 0
        assert data["average_score"] == 0.0

    async def test_get_weaknesses(self, client: AsyncClient, auth_headers: dict):
        """GET /progress/weaknesses should return an empty list initially."""
        response = await client.get("/api/progress/weaknesses", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    async def test_progress_requires_auth(self, client: AsyncClient):
        """GET /progress/ without auth should return 403."""
        response = await client.get("/api/progress/")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
class TestLeaderboard:
    async def test_get_leaderboard(self, client: AsyncClient, auth_headers: dict):
        """GET /leaderboard/ should return a leaderboard response."""
        response = await client.get("/api/leaderboard/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "period" in data
        assert "entries" in data
        assert isinstance(data["entries"], list)

    async def test_get_leaderboard_with_period(
        self, client: AsyncClient, auth_headers: dict
    ):
        """GET /leaderboard/?period=monthly should use the monthly period."""
        response = await client.get(
            "/api/leaderboard/?period=monthly", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "monthly"

    async def test_leaderboard_fallback_period(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Invalid period should fall back to weekly."""
        response = await client.get(
            "/api/leaderboard/?period=invalid", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "weekly"

    async def test_leaderboard_includes_current_user(
        self, client: AsyncClient, auth_headers: dict
    ):
        """The current user should appear in the leaderboard entries."""
        response = await client.get("/api/leaderboard/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # With a single user, that user should be in the entries
        assert len(data["entries"]) >= 1
        assert data["user_rank"] is not None

    async def test_leaderboard_requires_auth(self, client: AsyncClient):
        """GET /leaderboard/ without auth should return 403."""
        response = await client.get("/api/leaderboard/")
        assert response.status_code in (401, 403)

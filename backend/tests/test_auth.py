"""Tests for the authentication endpoints.

Fixtures (client, setup_database) are provided by conftest.py.
"""

import pytest
from httpx import AsyncClient

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

REGISTER_URL = "/api/auth/register"
LOGIN_URL = "/api/auth/login"
ME_URL = "/api/auth/me"


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    """Registering a new user should return tokens."""
    resp = await client.post(
        REGISTER_URL,
        json={
            "email": "test@example.com",
            "password": "securepass123",
            "display_name": "Tester",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Registering the same email twice should return 409."""
    payload = {
        "email": "dup@example.com",
        "password": "securepass123",
        "display_name": "Dup",
    }
    await client.post(REGISTER_URL, json=payload)
    resp = await client.post(REGISTER_URL, json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    """Logging in with correct credentials should return tokens."""
    await client.post(
        REGISTER_URL,
        json={
            "email": "login@example.com",
            "password": "securepass123",
            "display_name": "Tester",
        },
    )

    resp = await client.post(
        LOGIN_URL, json={"email": "login@example.com", "password": "securepass123"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    """Logging in with a wrong password should return 401."""
    await client.post(
        REGISTER_URL,
        json={
            "email": "wrong@example.com",
            "password": "securepass123",
            "display_name": "Tester",
        },
    )

    resp = await client.post(
        LOGIN_URL, json={"email": "wrong@example.com", "password": "badpassword"}
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient):
    """GET /me with a valid token should return the user profile."""
    reg_resp = await client.post(
        REGISTER_URL,
        json={
            "email": "me@example.com",
            "password": "securepass123",
            "display_name": "MeUser",
        },
    )
    token = reg_resp.json()["access_token"]

    resp = await client.get(ME_URL, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "me@example.com"
    assert data["display_name"] == "MeUser"
    assert data["level"] == "a2"
    assert data["xp"] == 0
    assert data["streak"] == 0


@pytest.mark.asyncio
async def test_get_me_no_token(client: AsyncClient):
    """GET /me without a token should return 403."""
    resp = await client.get(ME_URL)
    assert resp.status_code in (401, 403)

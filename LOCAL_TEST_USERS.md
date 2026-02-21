# Test Users

Use `scripts/seed-test-users.sh` to register these users via the API.

```bash
# Against production
BACKEND_URL=https://your-api-url ./scripts/seed-test-users.sh

# Against local
./scripts/seed-test-users.sh
```

## Test Student
- **Email:** test@darija.com
- **Password:** testpass123
- **Display Name:** TestLearner
- **Level:** a2
- **Role:** student

## Demo Student (has sample flashcards)
- **Email:** demo@darija.com
- **Password:** demopass123
- **Display Name:** DarijaFan
- **Level:** b1
- **Role:** student
- **Flashcards:** 10 common Darija words (salam, kif dayer, shukran, etc.)

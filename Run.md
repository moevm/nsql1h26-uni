
## Docker запуск (backend + db + frontend)

### Production-like режим

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend (FastAPI): `http://localhost:8080`

### Dev режим  с hot-reload

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Изменения в коде применяются автоматически без пересборки образа.

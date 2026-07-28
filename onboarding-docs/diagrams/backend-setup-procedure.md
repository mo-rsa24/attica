# Backend Setup — Procedure Diagram

How the Attica Django backend goes from a fresh clone to a running server.
Two fork points: shell-specific venv activation (Unix vs Windows), and optional test-data seeding.

```mermaid
flowchart TD
    START([Start\ngit clone done · cd backend])

    START --> VENV[Create virtual environment\npython3.12 -m venv venv]

    VENV --> SHELL{Which shell?}

    SHELL -->|macOS / Linux| UNIX[source venv/bin/activate]
    SHELL -->|Windows| WIN[venv\\Scripts\\activate]

    UNIX --> ACTIVE([venv active\nprompt shows '(venv)'])
    WIN  --> ACTIVE

    ACTIVE --> INSTALL[Install dependencies\npip install -r main/requirements.txt\nDjango · DRF · Channels · Redis · Pillow …]

    INSTALL --> MIGRATE[Run migrations\ncd main\npython manage.py migrate\n→ creates db.sqlite3]

    MIGRATE --> SEED{Need test data?}

    SEED -->|Yes| SEEDCMD[Seed e2e fixtures\npython manage.py seed_e2e\n→ e2e-organizer + sample vendors/locations]
    SEED -->|No — skip| READY

    SEEDCMD --> READY([Ready to start server])

    READY --> DAPHNE[Start Daphne\ndaphne -b 0.0.0.0 -p 8000 main.asgi:application]

    DAPHNE --> DONE([Backend running\nlocalhost:8000\nHTTP + WebSocket ready])
```

**Caption:** Django backend setup from a fresh clone. Fork at "Which shell?" merges before pip install; fork at "Need test data?" merges before Daphne. Both forks are brief — the linear spine is: venv → install → migrate → serve.

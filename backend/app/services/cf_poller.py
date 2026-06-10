from __future__ import annotations

import asyncio
import logging
from datetime import datetime

from app.db import get_db
from app.models import Duel
from app.services.cf_sync import process_duel_cf
from app.services.duel_completion import complete_duel

log = logging.getLogger("cf_poller")

TICK_SECONDS = 3.0


async def run_cf_poller_loop() -> None:
    log.info("cf_poller loop started")
    while True:
        db = next(get_db())
        try:
            duels = db.query(Duel).filter(Duel.status == "active").all()
            for d in duels:
                try:
                    if d.started_at and d.time_cap_seconds:
                        elapsed = (datetime.utcnow() - d.started_at).total_seconds()
                        if elapsed > d.time_cap_seconds:
                            await complete_duel(db, d, winner_user_id=None)
                            continue
                    await process_duel_cf(db, d, broadcast=True)
                except Exception:
                    log.exception("error processing duel %s", d.id)
        except Exception:
            log.exception("cf_poller tick error")
        finally:
            db.close()
        await asyncio.sleep(TICK_SECONDS)

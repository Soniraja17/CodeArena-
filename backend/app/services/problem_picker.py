from __future__ import annotations

import random
import time
from dataclasses import dataclass, field
from typing import Iterable

from app.services.codeforces import CodeforcesService


@dataclass
class CandidateProblem:
    contest_id: int
    index: str
    name: str
    rating: int
    tags: list[str] = field(default_factory=list)

    @property
    def problem_id(self) -> str:
        return f"{self.contest_id}-{self.index}"


@dataclass
class _Cache:
    problems: list[CandidateProblem] = field(default_factory=list)
    fetched_at: float = 0.0


_PROBLEM_CACHE = _Cache()
_CACHE_TTL_SECONDS = 24 * 3600


_FALLBACK_PROBLEMS: list[CandidateProblem] = [
    CandidateProblem(contest_id=4, index="A", name="Watermelon", rating=800, tags=["implementation"]),
    CandidateProblem(contest_id=4, index="B", name="Before an Exam", rating=1000, tags=["implementation", "math"]),
    CandidateProblem(contest_id=4, index="C", name="Registration System", rating=1200, tags=["data structures"]),
    CandidateProblem(contest_id=4, index="D", name="Mysterious Present", rating=1400, tags=["dp", "greedy"]),
    CandidateProblem(contest_id=4, index="E", name="Mysterious Language", rating=1600, tags=["combinatorics"]),
    CandidateProblem(contest_id=118, index="A", name="String Task", rating=1000, tags=["implementation", "strings"]),
    CandidateProblem(contest_id=118, index="B", name="Present from Lena", rating=1200, tags=["constructive algorithms"]),
    CandidateProblem(contest_id=118, index="C", name="Test", rating=1600, tags=["math", "number theory"]),
    CandidateProblem(contest_id=158, index="A", name="Next Round", rating=800, tags=["implementation"]),
    CandidateProblem(contest_id=158, index="B", name="Taxi", rating=1100, tags=["greedy", "implementation"]),
    CandidateProblem(contest_id=158, index="C", name="CD and pwd commands", rating=1400, tags=["data structures"]),
    CandidateProblem(contest_id=231, index="A", name="Team", rating=800, tags=["implementation"]),
    CandidateProblem(contest_id=231, index="B", name="Magic, Wizardry and Wonders", rating=1300, tags=["constructive algorithms"]),
    CandidateProblem(contest_id=263, index="A", name="Beautiful Matrix", rating=800, tags=["implementation"]),
    CandidateProblem(contest_id=263, index="B", name="Squares", rating=1100, tags=["sortings", "greedy"]),
    CandidateProblem(contest_id=282, index="A", name="Bit++", rating=800, tags=["implementation"]),
    CandidateProblem(contest_id=266, index="A", name="Stones on the Table", rating=800, tags=["implementation"]),
    CandidateProblem(contest_id=266, index="B", name="Queue at the School", rating=800, tags=["implementation"]),
    CandidateProblem(contest_id=339, index="A", name="Helpful Maths", rating=800, tags=["implementation", "sortings"]),
    CandidateProblem(contest_id=339, index="B", name="Xenia and Ringroad", rating=1000, tags=["implementation"]),
    CandidateProblem(contest_id=546, index="A", name="Soldier and Bananas", rating=800, tags=["implementation", "math"]),
    CandidateProblem(contest_id=546, index="B", name="Soldier and Badges", rating=1200, tags=["greedy", "sortings"]),
    CandidateProblem(contest_id=617, index="A", name="Elephant", rating=800, tags=["implementation", "math"]),
    CandidateProblem(contest_id=617, index="B", name="Chocolate", rating=1300, tags=["combinatorics", "dp"]),
    CandidateProblem(contest_id=50, index="A", name="Domino piling", rating=800, tags=["math", "greedy"]),
    CandidateProblem(contest_id=112, index="A", name="Petya and Strings", rating=800, tags=["implementation", "strings"]),
    CandidateProblem(contest_id=96, index="A", name="Football", rating=900, tags=["implementation", "strings"]),
    CandidateProblem(contest_id=69, index="A", name="Young Physicist", rating=1000, tags=["implementation", "math"]),
    CandidateProblem(contest_id=116, index="A", name="Tram", rating=800, tags=["implementation"]),
    CandidateProblem(contest_id=122, index="A", name="Lucky Division", rating=1000, tags=["implementation", "math"]),
    CandidateProblem(contest_id=58, index="A", name="Chat room", rating=1000, tags=["greedy", "strings"]),
    CandidateProblem(contest_id=71, index="A", name="Way Too Long Words", rating=800, tags=["implementation", "strings"]),
    CandidateProblem(contest_id=1, index="A", name="Theatre Square", rating=1000, tags=["math"]),
    CandidateProblem(contest_id=1234, index="A2", name="Perfectly Imperfect Array", rating=800, tags=["math"]),
    CandidateProblem(contest_id=1526, index="A", name="Mean Inequality", rating=800, tags=["constructive algorithms", "sortings"]),
    CandidateProblem(contest_id=1526, index="B1", name="I Hate 1111 (Easy)", rating=1100, tags=["math", "number theory"]),
    CandidateProblem(contest_id=1526, index="C1", name="Potions (Easy)", rating=1500, tags=["dp", "greedy"]),
    CandidateProblem(contest_id=1526, index="C2", name="Potions (Hard)", rating=1900, tags=["data structures", "greedy"]),
    CandidateProblem(contest_id=1535, index="A", name="Fair Playoff", rating=800, tags=["implementation", "sortings"]),
    CandidateProblem(contest_id=1535, index="B", name="Array Reodering", rating=1200, tags=["greedy", "math", "number theory"]),
    CandidateProblem(contest_id=1535, index="C", name="Unstable String", rating=1600, tags=["dp", "two pointers"]),
    CandidateProblem(contest_id=1535, index="D", name="Playoff Tournament", rating=1800, tags=["data structures", "trees"]),
    CandidateProblem(contest_id=1551, index="A", name="Strange Function", rating=800, tags=["math"]),
    CandidateProblem(contest_id=1551, index="B1", name="Wonderful Coloring", rating=1200, tags=["greedy", "implementation"]),
    CandidateProblem(contest_id=1551, index="C", name="Interesting Story", rating=1600, tags=["greedy", "dp"]),
    CandidateProblem(contest_id=1560, index="A", name="Dislike of Threes", rating=800, tags=["implementation"]),
    CandidateProblem(contest_id=1560, index="B", name="Who's Opposite?", rating=1000, tags=["math"]),
    CandidateProblem(contest_id=1560, index="C", name="Infinity Table", rating=1200, tags=["implementation", "math"]),
]

def _refresh_cache() -> None:
    try:
        raw = CodeforcesService.fetch_problemset()
        out: list[CandidateProblem] = []
        if raw:
            for p in raw:
                d = p if isinstance(p, dict) else (p.model_dump() if hasattr(p, "model_dump") else dict(p))
                rating = d.get("rating")
                contest_id = d.get("contestId") or d.get("contest_id")
                index = d.get("index")
                if not rating or not contest_id or not index:
                    continue
                out.append(
                    CandidateProblem(
                        contest_id=int(contest_id),
                        index=str(index),
                        name=str(d.get("name", "")),
                        rating=int(rating),
                        tags=[str(t) for t in (d.get("tags") or [])],
                    )
                )
        if out:
            _PROBLEM_CACHE.problems = out
            _PROBLEM_CACHE.fetched_at = time.time()
        else:
            raise RuntimeError("empty problemset from CF")
    except Exception:
        import logging
        logging.getLogger("problem_picker").warning("CF problemset unavailable — using fallback problem set")
        _PROBLEM_CACHE.problems = _FALLBACK_PROBLEMS
        _PROBLEM_CACHE.fetched_at = time.time()


def get_all_problems() -> list[CandidateProblem]:
    if not _PROBLEM_CACHE.problems or (time.time() - _PROBLEM_CACHE.fetched_at) > _CACHE_TTL_SECONDS:
        try:
            _refresh_cache()
        except Exception:
            pass
    return _PROBLEM_CACHE.problems


def step_ratings_for_elo(base_elo: int) -> list[int]:
    rounded = max(800, (base_elo // 100) * 100)
    return [rounded - 200, rounded - 100, rounded, rounded + 100, rounded + 200]


def pick_ladder(
    base_elo: int,
    exclude_problem_ids: Iterable[str] = (),
    deck_tags: Iterable[str] = (),
    rng: random.Random | None = None,
) -> list[CandidateProblem]:
    rng = rng or random.Random()
    excluded = set(exclude_problem_ids)
    deck = {t.lower() for t in deck_tags}
    pool = get_all_problems()

    if not pool:
        raise ValueError("problem pool is empty (CF API may be unreachable)")

    chosen: list[CandidateProblem] = []
    used: set[str] = set()
    for target in step_ratings_for_elo(base_elo):
        candidates = [
            p
            for p in pool
            if abs(p.rating - target) <= 50
            and p.problem_id not in excluded
            and p.problem_id not in used
        ]
        if deck:
            tagged = [p for p in candidates if any(t.lower() in deck for t in p.tags)]
            if tagged:
                candidates = tagged
        if not candidates:
            candidates = [
                p
                for p in pool
                if abs(p.rating - target) <= 150
                and p.problem_id not in excluded
                and p.problem_id not in used
            ]
        if not candidates:
            raise ValueError(f"no problem available near rating {target}")
        choice = rng.choice(candidates)
        chosen.append(choice)
        used.add(choice.problem_id)
    return chosen

import json
from pathlib import Path
from typing import Iterable


def write_report(report_file: str, entries: Iterable[dict]) -> None:
    report_path = Path(report_file)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with report_path.open("w", encoding="utf-8") as handle:
        json.dump({"entries": list(entries)}, handle, indent=2)

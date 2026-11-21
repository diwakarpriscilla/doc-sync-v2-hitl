import json
from pathlib import Path
from typing import Any


def load_mapping(mapping_file: str) -> dict[str, dict[str, Any]]:
    mapping_path = Path(mapping_file)
    if not mapping_path.is_file():
        raise ValueError(f"Mapping file not found: {mapping_file}")

    with mapping_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError("Mapping file must contain a JSON object")
    return data


def resolve_mapping(
    source_path: str, mappings: dict[str, dict[str, Any]]
) -> dict[str, Any]:
    try:
        target = mappings[source_path]
    except KeyError as exc:
        raise ValueError(f"No Confluence mapping for source file: {source_path}") from exc

    if not target.get("title") or not target.get("page_id"):
        raise ValueError(
            f"Incomplete Confluence mapping for source file: {source_path}"
        )
    return target

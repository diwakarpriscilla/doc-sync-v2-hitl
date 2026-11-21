from pathlib import Path


DOCUMENT_EXTENSIONS = {".md", ".markdown"}


def discover_documentation_files(changed_files: list[str]) -> list[str]:
    return sorted(
        {
            path
            for path in changed_files
            if Path(path).suffix.lower() in DOCUMENT_EXTENSIONS
        }
    )

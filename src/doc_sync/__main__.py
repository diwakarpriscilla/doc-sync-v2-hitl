import argparse
import json
import sys

from .config import ConfluenceConfig
from .confluence import ConfluenceClient
from .discovery import discover_documentation_files
from .mapping import load_mapping, resolve_mapping
from .render import render_markdown
from .report import write_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Synchronize documentation to Confluence")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--source-revision", required=True)
    parser.add_argument("--changed-files", required=True)
    parser.add_argument("--mapping-file", required=True)
    parser.add_argument("--report-file", required=True)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        if not args.dry_run:
            ConfluenceConfig.from_environment()
        mappings = load_mapping(args.mapping_file)
        changed_files = json.loads(args.changed_files)
        if not isinstance(changed_files, list):
            raise ValueError("--changed-files must be a JSON array")

        entries = []
        for source_path in discover_documentation_files(changed_files):
            target = resolve_mapping(source_path, mappings)
            from pathlib import Path

            markdown = Path(source_path).read_text(encoding="utf-8")
            content = render_markdown(markdown)
            entry = {
                "source": source_path,
                "source_revision": args.source_revision,
                "page_id": target["page_id"],
                "title": target["title"],
                "dry_run": args.dry_run,
                "status": "planned",
            }
            if not args.dry_run:
                page_url = ConfluenceClient(
                    ConfluenceConfig.from_environment()
                ).update_page(target["page_id"], target["title"], content)
                entry["status"] = "updated"
                entry["page_url"] = page_url
            entries.append(entry)

        write_report(args.report_file, entries)
        return 0
    except (OSError, ValueError, RuntimeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from src.doc_sync.config import ConfluenceConfig
from src.doc_sync.discovery import discover_documentation_files
from src.doc_sync.mapping import load_mapping, resolve_mapping
from src.doc_sync.render import render_markdown


class DocumentationSyncTests(unittest.TestCase):
    def test_discovers_only_documentation_files(self):
        changed = ["README.md", "src/app.py", "docs/guide.markdown"]
        self.assertEqual(
            discover_documentation_files(changed),
            ["README.md", "docs/guide.markdown"],
        )

    def test_missing_environment_fails_before_client_creation(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(ValueError):
                ConfluenceConfig.from_environment()

    def test_load_and_resolve_mapping(self):
        with tempfile.TemporaryDirectory() as directory:
            mapping_file = Path(directory) / "mapping.json"
            mapping_file.write_text(
                json.dumps({"README.md": {"title": "Readme", "page_id": "123"}}),
                encoding="utf-8",
            )
            mappings = load_mapping(str(mapping_file))
            target = resolve_mapping("README.md", mappings)
            self.assertEqual(target["page_id"], "123")

    def test_render_returns_storage_format(self):
        content = render_markdown("# Documentation")
        self.assertIn("ac:structured-macro", content)
        self.assertIn("# Documentation", content)


if __name__ == "__main__":
    unittest.main()

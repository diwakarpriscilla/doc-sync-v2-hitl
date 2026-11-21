import base64
import json
from urllib import request
from urllib.error import HTTPError, URLError

from .config import ConfluenceConfig


class ConfluenceClient:
    def __init__(self, config: ConfluenceConfig):
        self.config = config

    def update_page(self, page_id: str, title: str, content: str) -> str:
        credentials = f"{self.config.email}:{self.config.api_token}".encode("utf-8")
        authorization = base64.b64encode(credentials).decode("ascii")
        url = f"{self.config.base_url}/rest/api/content/{page_id}"
        payload = json.dumps(
            {
                "id": page_id,
                "type": "page",
                "title": title,
                "status": "current",
                "version": {"number": 1},
                "body": {
                    "storage": {
                        "value": content,
                        "representation": "storage",
                    }
                },
            }
        ).encode("utf-8")
        req = request.Request(
            url,
            data=payload,
            method="PUT",
            headers={
                "Authorization": f"Basic {authorization}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        )
        try:
            with request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            raise RuntimeError(
                f"Confluence API returned HTTP {exc.code}"
            ) from exc
        except URLError as exc:
            raise RuntimeError("Unable to reach Confluence") from exc

        links = result.get("_links", {})
        base = links.get("base", self.config.base_url)
        return f"{base}{links.get('webui', '')}"

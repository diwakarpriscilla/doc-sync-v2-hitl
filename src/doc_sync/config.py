import os
from dataclasses import dataclass


@dataclass(frozen=True)
class ConfluenceConfig:
    base_url: str
    email: str
    api_token: str
    space_key: str

    @classmethod
    def from_environment(cls) -> "ConfluenceConfig":
        required = (
            "CONFLUENCE_BASE_URL",
            "CONFLUENCE_EMAIL",
            "CONFLUENCE_API_TOKEN",
            "CONFLUENCE_SPACE_KEY",
        )
        missing = [name for name in required if not os.getenv(name)]
        if missing:
            raise ValueError(
                "Missing required environment variables: " + ", ".join(missing)
            )
        return cls(
            base_url=os.environ["CONFLUENCE_BASE_URL"].rstrip("/"),
            email=os.environ["CONFLUENCE_EMAIL"],
            api_token=os.environ["CONFLUENCE_API_TOKEN"],
            space_key=os.environ["CONFLUENCE_SPACE_KEY"],
        )

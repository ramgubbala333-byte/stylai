import logging
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional
import aiofiles
from app.core.config import settings

logger = logging.getLogger(__name__)

class StorageBackend(ABC):
    @abstractmethod
    async def upload(self, key: str, data: bytes, content_type: str) -> str: ...
    @abstractmethod
    async def download(self, key: str) -> Optional[bytes]: ...
    @abstractmethod
    def get_url(self, key: str) -> str: ...

class LocalStorageBackend(StorageBackend):
    def __init__(self, base_path: str = "./storage"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def upload(self, key: str, data: bytes, content_type: str) -> str:
        fp = self.base_path / key
        fp.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(fp, "wb") as f:
            await f.write(data)
        return self.get_url(key)

    async def download(self, key: str) -> Optional[bytes]:
        fp = self.base_path / key
        if not fp.exists(): return None
        async with aiofiles.open(fp, "rb") as f:
            return await f.read()

    def get_url(self, key: str) -> str:
        return f"/static/{key}"

class S3StorageBackend(StorageBackend):
    def __init__(self):
        import boto3
        self.bucket = settings.AWS_S3_BUCKET
        kwargs = {"aws_access_key_id": settings.AWS_ACCESS_KEY_ID, "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY, "region_name": settings.AWS_S3_REGION}
        if settings.AWS_S3_ENDPOINT_URL:
            kwargs["endpoint_url"] = settings.AWS_S3_ENDPOINT_URL
        self._client = boto3.client("s3", **kwargs)

    async def upload(self, key: str, data: bytes, content_type: str) -> str:
        import asyncio
        await asyncio.to_thread(self._client.put_object, Bucket=self.bucket, Key=key, Body=data, ContentType=content_type)
        return self.get_url(key)

    async def download(self, key: str) -> Optional[bytes]:
        import asyncio
        try:
            r = await asyncio.to_thread(self._client.get_object, Bucket=self.bucket, Key=key)
            return r["Body"].read()
        except Exception:
            return None

    def get_url(self, key: str) -> str:
        if settings.AWS_S3_ENDPOINT_URL:
            return f"{settings.AWS_S3_ENDPOINT_URL}/{self.bucket}/{key}"
        return f"https://{self.bucket}.s3.{settings.AWS_S3_REGION}.amazonaws.com/{key}"

def get_storage_backend() -> StorageBackend:
    if settings.STORAGE_BACKEND == "s3":
        return S3StorageBackend()
    return LocalStorageBackend(base_path=settings.LOCAL_STORAGE_PATH)
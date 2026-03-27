"""
Storage Abstraction Layer

Provides a unified interface for file storage regardless of backend.
Currently supports:
- LocalStorageBackend: filesystem storage for development
- S3StorageBackend: AWS S3 or any S3-compatible service (MinIO, Cloudflare R2, etc.)

Usage:
    storage = get_storage_backend()
    url = await storage.upload(key="selfies/user-id/photo.jpg", data=bytes, content_type="image/jpeg")
    data = await storage.download(key="selfies/user-id/photo.jpg")
    await storage.delete(key="selfies/user-id/photo.jpg")
"""

import logging
import os
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional

import aiofiles
import boto3
from botocore.exceptions import ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageBackend(ABC):
    """Abstract base for all storage backends."""

    @abstractmethod
    async def upload(self, key: str, data: bytes, content_type: str) -> str:
        """Upload bytes to storage. Returns the public or presigned URL."""
        ...

    @abstractmethod
    async def download(self, key: str) -> Optional[bytes]:
        """Download and return file bytes. Returns None if not found."""
        ...

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete a file. Returns True on success."""
        ...

    @abstractmethod
    def get_url(self, key: str) -> str:
        """Get the URL for a given storage key."""
        ...


class LocalStorageBackend(StorageBackend):
    """
    Local filesystem storage for development.
    Files are stored under LOCAL_STORAGE_PATH.
    URLs are served via the FastAPI /static endpoint.
    """

    def __init__(self, base_path: str = "./storage"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def upload(self, key: str, data: bytes, content_type: str) -> str:
        file_path = self.base_path / key
        file_path.parent.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(data)

        logger.info(f"Stored file locally: {file_path}")
        return self.get_url(key)

    async def download(self, key: str) -> Optional[bytes]:
        file_path = self.base_path / key
        if not file_path.exists():
            return None

        async with aiofiles.open(file_path, "rb") as f:
            return await f.read()

    async def delete(self, key: str) -> bool:
        file_path = self.base_path / key
        try:
            file_path.unlink(missing_ok=True)
            return True
        except Exception as e:
            logger.error(f"Failed to delete {key}: {e}")
            return False

    def get_url(self, key: str) -> str:
        return f"/static/{key}"


class S3StorageBackend(StorageBackend):
    """
    AWS S3 (or S3-compatible) storage backend.
    Suitable for staging and production.
    """

    def __init__(self):
        self.bucket = settings.AWS_S3_BUCKET
        self.region = settings.AWS_S3_REGION

        kwargs = {
            "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
            "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
            "region_name": self.region,
        }
        if settings.AWS_S3_ENDPOINT_URL:
            kwargs["endpoint_url"] = settings.AWS_S3_ENDPOINT_URL

        self._client = boto3.client("s3", **kwargs)

    async def upload(self, key: str, data: bytes, content_type: str) -> str:
        import asyncio
        await asyncio.to_thread(
            self._client.put_object,
            Bucket=self.bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        return self.get_url(key)

    async def download(self, key: str) -> Optional[bytes]:
        import asyncio
        try:
            response = await asyncio.to_thread(
                self._client.get_object,
                Bucket=self.bucket,
                Key=key,
            )
            return response["Body"].read()
        except ClientError as e:
            if e.response["Error"]["Code"] == "NoSuchKey":
                return None
            raise

    async def delete(self, key: str) -> bool:
        import asyncio
        try:
            await asyncio.to_thread(
                self._client.delete_object,
                Bucket=self.bucket,
                Key=key,
            )
            return True
        except ClientError as e:
            logger.error(f"S3 delete error for {key}: {e}")
            return False

    def get_url(self, key: str) -> str:
        if settings.AWS_S3_ENDPOINT_URL:
            return f"{settings.AWS_S3_ENDPOINT_URL}/{self.bucket}/{key}"
        return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{key}"


def get_storage_backend() -> StorageBackend:
    """Factory function — returns the configured storage backend."""
    if settings.STORAGE_BACKEND == "s3":
        return S3StorageBackend()
    return LocalStorageBackend(base_path=settings.LOCAL_STORAGE_PATH)

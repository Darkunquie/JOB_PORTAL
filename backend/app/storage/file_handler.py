import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.config import settings


class FileHandler:
    """
    Handles file uploads to local filesystem with security validations.
    """

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.max_size = settings.MAX_UPLOAD_SIZE
        self.allowed_types = settings.allowed_resume_types_list

        # Create upload directory if it doesn't exist
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def validate_file(self, file: UploadFile) -> None:
        """
        Validate uploaded file for type and size.

        Args:
            file: Uploaded file

        Raises:
            HTTPException: If validation fails
        """
        # Validate file type
        if file.content_type not in self.allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(self.allowed_types)}"
            )

        # File size will be validated during read

    async def save_resume(self, file: UploadFile, user_id: int) -> str:
        """
        Save resume file to local storage.

        Args:
            file: Uploaded file
            user_id: User ID for organizing files

        Returns:
            Relative file path for storage in database

        Raises:
            HTTPException: If file is invalid or save fails
        """
        self.validate_file(file)

        # Generate unique filename
        file_ext = Path(file.filename).suffix
        unique_filename = f"{user_id}_{uuid.uuid4()}{file_ext}"

        # Create user-specific subdirectory
        user_dir = self.upload_dir / str(user_id)
        user_dir.mkdir(exist_ok=True)

        file_path = user_dir / unique_filename

        # Save file with size validation
        try:
            content = await file.read()

            # Validate file size
            if len(content) > self.max_size:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File too large. Maximum size: {self.max_size / 1024 / 1024:.1f}MB"
                )

            with open(file_path, "wb") as f:
                f.write(content)

        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )

        # Return relative path for database storage
        return f"/uploads/{user_id}/{unique_filename}"

    def delete_file(self, file_url: str) -> None:
        """
        Delete a file from local storage.

        Args:
            file_url: Relative file path from database
        """
        try:
            # Convert relative URL to absolute path
            file_path = self.upload_dir.parent / file_url.lstrip("/")

            if file_path.exists():
                file_path.unlink()
        except Exception:
            # Silently fail on delete errors (file might already be deleted)
            pass

    def get_absolute_path(self, file_url: str) -> Path:
        """
        Convert relative file URL to absolute filesystem path.

        Args:
            file_url: Relative file path from database

        Returns:
            Absolute path to file
        """
        return self.upload_dir.parent / file_url.lstrip("/")


# Singleton instance
file_handler = FileHandler()

from fastapi import HTTPException, status


class DeepGuardBaseException(Exception):
    """Base exception class for DeepGuard application errors."""
    pass


class CheckpointMissingError(DeepGuardBaseException):
    """Raised when an operation requests inference on a model whose weights have not been downloaded."""
    def __init__(self, model_name: str, expected_path: str):
        self.model_name = model_name
        self.expected_path = expected_path
        super().__init__(
            f"Trained checkpoint weights for '{model_name}' are not found at '{expected_path}'. "
            "Please train the model via the provided Google Colab notebook and download 'best_model.pth' "
            "into the artifacts directory before running inference."
        )


class ModelNotFoundError(DeepGuardBaseException):
    """Raised when an unsupported model architecture identifier is requested."""
    def __init__(self, model_name: str):
        super().__init__(f"Requested model '{model_name}' is not recognized or supported.")


class FileValidationError(DeepGuardBaseException):
    """Raised when an uploaded file violates format, extension, or size limits."""
    def __init__(self, message: str):
        super().__init__(message)


class FaceDetectionError(DeepGuardBaseException):
    """Raised when face detection pipeline fails."""
    def __init__(self, message: str):
        super().__init__(message)


class VideoProcessingError(DeepGuardBaseException):
    """Raised when video decoding or frame sampling fails."""
    def __init__(self, message: str):
        super().__init__(message)


class AnalysisNotFoundError(DeepGuardBaseException):
    """Raised when a query requests a non-existent analysis ID."""
    def __init__(self, analysis_id: str):
        super().__init__(f"Analysis with ID '{analysis_id}' was not found in database records.")

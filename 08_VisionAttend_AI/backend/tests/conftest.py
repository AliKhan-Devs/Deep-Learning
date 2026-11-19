import pytest
import os
import tempfile
import numpy as np
from pathlib import Path

# Override DB to a temporary test DB
test_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
test_db_path = Path(test_db_file.name)
test_db_file.close()

from app.config import settings
settings.DB_PATH = test_db_path

from app.core.database import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
    yield
    if test_db_path.exists():
        try:
            os.remove(test_db_path)
        except Exception:
            pass

import logging
import sys
import json
from datetime import datetime

# --------------------------------------------------
# JSON LOG FORMATTER
# --------------------------------------------------
class JsonFormatter(logging.Formatter):
    def format(self, record):
        log = {
            "time": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }

        if hasattr(record, "request_id"):
            log["request_id"] = record.request_id

        if record.exc_info:
            log["exception"] = self.formatException(record.exc_info)

        return json.dumps(log)


# --------------------------------------------------
# LOGGING SETUP
# --------------------------------------------------
def setup_logging(level: str = "INFO"):
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    root.addHandler(handler)


# --------------------------------------------------
# ✅ EXPORTED APPLICATION LOGGER
# --------------------------------------------------
logger = logging.getLogger("jobmarket")

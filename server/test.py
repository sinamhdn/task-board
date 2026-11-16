import logging

logger = logging.getLogger(f"test logger: filename -> {__name__}")

test_dict = {"ka": "a", "kb": "b", "kc": "c", "kd": "d"}
for channel in test_dict:
    logger.info(test_dict[channel])

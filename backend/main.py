# std:
import logging

# dep:
import api
import dbms

#
# Variables
#

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
_logger = logging.getLogger(__name__)

#
# Functions
#

def main():
        ok = dbms.start()
        if not ok:
                _logger.error("unable to start database")

                return

        ok = api.start()
        if not ok:
                _logger.error("unable to start api")

                return

        dbms.close()

if __name__ == "__main__":
        main()


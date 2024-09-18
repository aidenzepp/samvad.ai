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
        _logger.info("main: starting...")

        _logger.info("main: starting database")
        try:
                dbms.startup()
        except Exception as ex:
                _logger.error(f"main: error: {ex}")

                return

        _logger.info("main: creating sample data")
        dbms.sample()

        _logger.info("main: starting server")
        api.server.run(debug=True)

        _logger.info("main: cleaning database")
        dbms.cleanup()

        _logger.info("main: complete")

if __name__ == "__main__":
        main()


from ingestion.stream_listener import StreamListener
from storage.repository import Repository


def main() -> None:
    repository = Repository()

    listener = StreamListener(repository)

    listener.run()


if __name__ == "__main__":
    main()
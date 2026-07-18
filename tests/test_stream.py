from ingestion.stream_listener import StreamListener
from storage.repository import Repository


repo = Repository()

listener = StreamListener(repo)

listener.run()


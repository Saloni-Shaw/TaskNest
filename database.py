from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()    # create a session

    try:
        yield db           # give it to the endpoint

    finally:
        db.close()         # close it when finished


from models import Base

Base.metadata.create_all(bind=engine)


#dotenv-> The function that reads .env.
#os->Python's built-in module for interacting with environment variables.
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

load_dotenv() 

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    try:
        from env import DATABASE_URL as LOCAL_DATABASE_URL
        DATABASE_URL = LOCAL_DATABASE_URL
    except ImportError:
        raise RuntimeError("DATABASE_URL not set and env.py missing")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
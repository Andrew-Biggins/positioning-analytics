from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Update this with your actual connection string
DATABASE_URL = "postgresql+psycopg2://username:password@localhost:5432/markets"

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

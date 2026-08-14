from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Database URL (Yahan hum SQLite use kar rahe hain as a local database file)
# Agar aap PostgreSQL use karna chahte hain, toh URL kuch aisa hoga:
# "postgresql://username:password@localhost:5432/dbname"
DATABASE_URL = "sqlite:///./taskflow.db"

# 2. SQLAlchemy Engine Create karna
# check_same_thread=False sirf SQLite ke liye zaroori hai taaki multiple threads queries run kar sakein
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. SessionLocal Class (Database sessions manage karne ke liye)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base Class (Jiss se aapke saare ORM Models inherit karenge)
Base = declarative_base()

# 5. Dependency Function (FastAPI routes ke andar DB session inject karne ke liye)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
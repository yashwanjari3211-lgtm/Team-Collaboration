from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Board(Base):
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    columns = relationship("BoardColumn", back_populates="board", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="board", cascade="all, delete-orphan")

class BoardColumn(Base):
    __tablename__ = "board_columns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    board_id = Column(Integer, ForeignKey('boards.id'), nullable=False)
    order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    board = relationship("Board", back_populates="columns")
    tasks = relationship("Task", back_populates="column", cascade="all, delete-orphan")

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SavedMessage(Base):
    __tablename__ = "saved_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    message_id = Column(Integer, ForeignKey('messages.id'), nullable=False)

    message = relationship("Message")

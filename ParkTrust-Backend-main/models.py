from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    image_url = Column(String)
    entry_x = Column(String, default="0")
    entry_y = Column(String, default="0")

class Slot(Base):
    __tablename__ = "slots"

    # Slot ID logic: db_id is internal PK, slot_id is the string "A1", etc.
    
    db_id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(String, index=True)
    site_id = Column(String, ForeignKey("sites.id"))
    x = Column(String)  # Can be integer or percentage string (e.g., "45.2%")
    y = Column(String)  # Can be integer or percentage string (e.g., "30.5%")
    occupied = Column(Boolean, default=False)
    sensor_status = Column(String, default="EMPTY")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String, index=True)
    timestamp = Column(Integer)
    plate_number = Column(String)
    assigned_slot = Column(String)
    site_id = Column(String)
    prev_hash = Column(String)
    hash = Column(String)
    type = Column(String, default="ENTRY") # ENTRY or EXIT
    fee = Column(String, nullable=True)
    entry_method = Column(String, default="PLATE") # FASTAG or PLATE

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    message = Column(String)
    severity = Column(String)
    site_id = Column(String)
    timestamp = Column(Integer)

import os
import sys

# Add backend directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.organization import Organization
from app.models.workspace import Workspace
from app.models.channel import Channel

def seed():
    db = SessionLocal()
    try:
        # Check if channel 1 exists
        if not db.query(Channel).filter(Channel.id == 1).first():
            # Create a default organization
            org = Organization(name="Default Organization")
            db.add(org)
            db.commit()
            db.refresh(org)

            # Create a default workspace
            workspace = Workspace(name="Default Workspace", organization_id=org.id)
            db.add(workspace)
            db.commit()
            db.refresh(workspace)

            # Create the default channel with ID 1
            channel = Channel(name="general", workspace_id=workspace.id)
            db.add(channel)
            db.commit()
            print("Successfully seeded the database with default organization, workspace, and channel 1.")
        else:
            print("Channel 1 already exists. No seeding required.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

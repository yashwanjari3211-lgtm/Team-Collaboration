from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.board import BoardCreate, BoardOut, BoardUpdate, BoardColumnCreate, BoardColumnOut, BoardColumnUpdate
from app.models.board import Board, BoardColumn
from app.models.user import User
from app.models.organization import Organization
from app.utils.dependencies import get_current_user, get_current_organization

router = APIRouter()

# Boards
@router.post("/", response_model=BoardOut)
def create_board(board: BoardCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_board = Board(**board.dict(), organization_id=org.id)
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    
    # Create default columns
    default_columns = [
        BoardColumn(name="To Do", board_id=db_board.id, order=0),
        BoardColumn(name="In Progress", board_id=db_board.id, order=1),
        BoardColumn(name="Done", board_id=db_board.id, order=2)
    ]
    db.add_all(default_columns)
    db.commit()
    db.refresh(db_board)
    
    return db_board

@router.get("/", response_model=list[BoardOut])
def list_boards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    return db.query(Board).filter(Board.organization_id == org.id).order_by(Board.id).all()

@router.get("/{board_id}", response_model=BoardOut)
def get_board(board_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    board = db.query(Board).filter(Board.id == board_id, Board.organization_id == org.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board

@router.patch("/{board_id}", response_model=BoardOut)
def update_board(board_id: int, board_update: BoardUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_board = db.query(Board).filter(Board.id == board_id, Board.organization_id == org.id).first()
    if not db_board:
        raise HTTPException(status_code=404, detail="Board not found")
    for key, value in board_update.dict(exclude_unset=True).items():
        setattr(db_board, key, value)
    db.commit()
    db.refresh(db_board)
    return db_board

@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(board_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    db_board = db.query(Board).filter(Board.id == board_id, Board.organization_id == org.id).first()
    if not db_board:
        raise HTTPException(status_code=404, detail="Board not found")
    db.delete(db_board)
    db.commit()
    return None

# Columns
@router.post("/{board_id}/columns", response_model=BoardColumnOut)
def create_column(board_id: int, column: BoardColumnCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    board = db.query(Board).filter(Board.id == board_id, Board.organization_id == org.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    db_column = BoardColumn(**column.dict(), board_id=board_id)
    db.add(db_column)
    db.commit()
    db.refresh(db_column)
    return db_column

@router.patch("/{board_id}/columns/{column_id}", response_model=BoardColumnOut)
def update_column(board_id: int, column_id: int, column_update: BoardColumnUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    board = db.query(Board).filter(Board.id == board_id, Board.organization_id == org.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    db_column = db.query(BoardColumn).filter(BoardColumn.id == column_id, BoardColumn.board_id == board_id).first()
    if not db_column:
        raise HTTPException(status_code=404, detail="Column not found")
    for key, value in column_update.dict(exclude_unset=True).items():
        setattr(db_column, key, value)
    db.commit()
    db.refresh(db_column)
    return db_column

@router.delete("/{board_id}/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_column(board_id: int, column_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), org: Organization = Depends(get_current_organization)):
    board = db.query(Board).filter(Board.id == board_id, Board.organization_id == org.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    db_column = db.query(BoardColumn).filter(BoardColumn.id == column_id, BoardColumn.board_id == board_id).first()
    if not db_column:
        raise HTTPException(status_code=404, detail="Column not found")
    db.delete(db_column)
    db.commit()
    return None

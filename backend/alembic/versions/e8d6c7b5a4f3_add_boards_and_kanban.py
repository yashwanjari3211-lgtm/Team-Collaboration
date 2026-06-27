"""add boards and kanban

Revision ID: e8d6c7b5a4f3
Revises: b2a1c4d5e6f7
Create Date: 2026-06-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e8d6c7b5a4f3'
down_revision = 'b2a1c4d5e6f7'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Create boards table
    op.create_table(
        'boards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_boards_id'), 'boards', ['id'], unique=False)

    # 2. Create board_columns table
    op.create_table(
        'board_columns',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('board_id', sa.Integer(), nullable=False),
        sa.Column('order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['board_id'], ['boards.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_board_columns_id'), 'board_columns', ['id'], unique=False)

    # 3. Add new columns to tasks
    op.add_column('tasks', sa.Column('board_id', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('column_id', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('order', sa.Integer(), server_default='0', nullable=True))
    op.add_column('tasks', sa.Column('priority', sa.String(), server_default='medium', nullable=True))
    op.add_column('tasks', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))

    # We use batch_alter_table for SQLite compatibility if needed, but standard add_column works on PG.
    op.create_foreign_key('fk_tasks_board_id', 'tasks', 'boards', ['board_id'], ['id'])
    op.create_foreign_key('fk_tasks_column_id', 'tasks', 'board_columns', ['column_id'], ['id'])

    # 4. Migrate data: create a default board for each org, default columns, and assign tasks
    # We will do this using simple SQL execution
    conn = op.get_bind()
    orgs = conn.execute(sa.text("SELECT id, name FROM organizations")).fetchall()
    
    for org in orgs:
        # Create a default board
        board_id = conn.execute(
            sa.text("INSERT INTO boards (name, organization_id) VALUES (:name, :org_id) RETURNING id"),
            {"name": "General Board", "org_id": org[0]}
        ).scalar()
        
        # Create default columns
        col1 = conn.execute(sa.text("INSERT INTO board_columns (name, board_id, \"order\") VALUES ('To Do', :board_id, 0) RETURNING id"), {"board_id": board_id}).scalar()
        col2 = conn.execute(sa.text("INSERT INTO board_columns (name, board_id, \"order\") VALUES ('In Progress', :board_id, 1) RETURNING id"), {"board_id": board_id}).scalar()
        col3 = conn.execute(sa.text("INSERT INTO board_columns (name, board_id, \"order\") VALUES ('Done', :board_id, 2) RETURNING id"), {"board_id": board_id}).scalar()
        
        # Move all tasks in this org to the To Do column of the new board
        conn.execute(
            sa.text("UPDATE tasks SET board_id = :board_id, column_id = :col_id WHERE organization_id = :org_id AND (status = 'todo' OR status IS NULL)"),
            {"board_id": board_id, "col_id": col1, "org_id": org[0]}
        )
        conn.execute(
            sa.text("UPDATE tasks SET board_id = :board_id, column_id = :col_id WHERE organization_id = :org_id AND status = 'in_progress'"),
            {"board_id": board_id, "col_id": col2, "org_id": org[0]}
        )
        conn.execute(
            sa.text("UPDATE tasks SET board_id = :board_id, column_id = :col_id WHERE organization_id = :org_id AND status = 'done'"),
            {"board_id": board_id, "col_id": col3, "org_id": org[0]}
        )

    # 5. Drop old columns from tasks
    # Note: SQLite doesn't support DROP COLUMN out of the box with alter_table, but postgres does.
    # We assume Postgres here. If SQLite is used, batch_alter_table is needed.
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_constraint('tasks_channel_id_fkey', type_='foreignkey')
        batch_op.drop_column('channel_id')
        batch_op.drop_column('status')


def downgrade():
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('status', sa.VARCHAR(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('channel_id', sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.create_foreign_key('tasks_channel_id_fkey', 'channels', ['channel_id'], ['id'])
        batch_op.drop_constraint('fk_tasks_column_id', type_='foreignkey')
        batch_op.drop_constraint('fk_tasks_board_id', type_='foreignkey')
        batch_op.drop_column('updated_at')
        batch_op.drop_column('priority')
        batch_op.drop_column('order')
        batch_op.drop_column('column_id')
        batch_op.drop_column('board_id')

    op.drop_index(op.f('ix_board_columns_id'), table_name='board_columns')
    op.drop_table('board_columns')
    op.drop_index(op.f('ix_boards_id'), table_name='boards')
    op.drop_table('boards')

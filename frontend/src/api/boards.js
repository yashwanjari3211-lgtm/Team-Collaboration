import client from './client';

export const getBoards = () => {
  return client.get('/boards');
};

export const getBoard = (boardId) => {
  return client.get(`/boards/${boardId}`);
};

export const createBoard = (data) => {
  return client.post('/boards', data);
};

export const updateBoard = (boardId, data) => {
  return client.patch(`/boards/${boardId}`, data);
};

export const deleteBoard = (boardId) => {
  return client.delete(`/boards/${boardId}`);
};

export const createColumn = (boardId, data) => {
  return client.post(`/boards/${boardId}/columns`, data);
};

export const updateColumn = (boardId, columnId, data) => {
  return client.patch(`/boards/${boardId}/columns/${columnId}`, data);
};

export const deleteColumn = (boardId, columnId) => {
  return client.delete(`/boards/${boardId}/columns/${columnId}`);
};

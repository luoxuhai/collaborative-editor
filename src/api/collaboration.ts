import request from '@/utils/request';

export const getCollaboration = () =>
  request.get(`/collaboration/getCollaboration`);

export const getCollaborator = async ({ id }) =>
  request.get('/collaboration/getCollaborator', { params: { id } });

export const addCollaborator = async ({ id, email }) =>
  request.put('/collaboration/addCollaborator', { id, email });

export const deleteCollaborator = async ({ fileId, userId }) =>
  request.delete('/collaboration/deleteCollaborator', {
    params: {
      fileId,
      userId,
    },
  });

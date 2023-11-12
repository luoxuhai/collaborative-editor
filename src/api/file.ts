import request from '@/utils/request';

export const getStarFiles = () => request.get(`/files/getStarFiles`);

export const getFilesByParent = ({ parentId }: { parentId: string }) =>
  request.get(`/files/getFilesByParent`, {
    params: {
      parentId,
    },
  });

export const getFilesByName = ({ name }: { name: string }) =>
  request.get(`/files/getFilesByName`, {
    params: {
      name,
    },
  });

export const getFileById = ({ id }: { id: string }) =>
  request.get(`/files/getFileById`, {
    params: {
      id,
    },
  });

export const createFile = ({ parentId, name, type = 'doc' }) =>
  request.post(`/files/createFile`, {
    parentId,
    name,
    type,
  });

export const deleteFile = ({ id }) =>
  request.delete(`/files/deleteFile`, {
    params: { id },
  });

export const updateFile = ({ id, name }) =>
  request.put(`/files/updateFile`, {
    id,
    name,
  });

export const sharePermission = ({ id, ...permission }) =>
  request.put(`/files/sharePermission`, {
    id,
    ...permission,
  });

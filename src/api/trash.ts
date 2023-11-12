import request from '@/utils/request';

export const getTrashFiles = () => request.get(`/trash/getTrashFiles`);

export const deleteTrashFile = ({
  id,
  empty = '0',
}: {
  id?: string;
  empty?: string;
}) =>
  request.delete(`/trash/deleteTrashFile`, {
    params: { id, empty },
  });

export const restoreTrashFile = ({ id }: { id?: string }) =>
  request.post(`/trash/restoreTrashFile`, {
    id,
  });

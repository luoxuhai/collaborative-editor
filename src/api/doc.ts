import request from '@/utils/request';

export const getDocsByFolder = ({ folder }: { folder: string }) =>
  request.get(`/files`, {
    params: {
      folder,
    },
  });

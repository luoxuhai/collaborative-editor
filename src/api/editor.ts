import request from '@/utils/request';

export const uploadImage = (params: any) =>
  request.post(`/editor/uploadImage`, params);

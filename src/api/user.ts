import request from '@/utils/request';

export const queryUserInfoByToken = async () =>
  request('/users/getUserInfoByToken');

export const getUserInfoById = async ({ id }) =>
  request.get('/users/getUserInfoById', {
    params: {
      id,
    },
  });

export const login = async (data: any) =>
  request('/users/login', { method: 'post', data });

export const queryVerificationCode = async (params: { email?: string }) =>
  request('/users/verify_code', { method: 'get', params });

export const starFile = async ({ id, operate = 'add' }) =>
  request.post('/users/star', { id, operate });

export const updateEmail = async ({ email }) =>
  request.put('/users/updateEmail', { email });

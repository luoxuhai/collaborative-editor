import axios from 'axios';
import { getDvaApp } from 'umi';
import { message } from 'antd';

import { getLocalToken } from './utils';

export function noLoginError() {
  message.warn('请登录后操作！');
  getDvaApp()._store.dispatch({
    type: 'global/changeLoginPaneVisible',
    payload: true,
  });
}

const instance = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:8080'
      : 'https://editor.fastools.cn/api',
});

// 添加请求拦截器
instance.interceptors.request.use(
  async function (config) {
    const token = await getLocalToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (/status code 422/.test(error)) {
      noLoginError();
    }
    return Promise.reject(error);
  },
);

export default instance;

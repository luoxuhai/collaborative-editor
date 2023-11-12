import localforage from 'localforage';
import { queryUserInfoByToken, login } from '@/api/user';
import { message } from 'antd';
import { history } from 'umi';

export default {
  namespace: 'login',

  state: {
    token: '',
    user: {},
  },

  subscriptions: {},

  reducers: {
    setUserInfo(state: any, { payload }: any) {
      localforage.setItem('user', payload);
      return {
        ...state,
        ...payload,
      };
    },
  },

  effects: {
    *queryUserInfo({ payload }: any, { put }: any) {
      const result = yield queryUserInfoByToken();

      if (!result.user) {
        put({
          type: 'logout',
        });
        return;
      }

      yield put({
        type: 'setUserInfo',
        payload: { user: result.user, token: payload },
      });
    },

    *login({ payload }: any, { put }: any) {
      const { user, token } = yield login(payload);

      yield put({
        type: 'global/changeLogging',
        payload: false,
      });

      if (!user) {
        message.error({ content: '登录失败!' });
        return;
      }

      if (window.isMobile) {
        const loginPath = localStorage.getItem('loginPath');
        if (loginPath) {
          history.replace(loginPath);
          window.localStorage.removeItem('loginPath');
        } else history.replace('/');
      }

      message.success({ content: '登录成功' });

      yield put({
        type: 'setUserInfo',
        payload: { user, token },
      });

      yield localforage.setItem('user', { user, token });
      location.reload();
    },

    *logout(_: any, { put }: any) {
      yield put({
        type: 'global/changePayPaneVisible',
        payload: false,
      });
      yield put({
        type: 'global/changeVisibleDrawer',
        payload: false,
      });
      yield put({
        type: 'clearUserInfo',
      });
      yield localforage.removeItem('user');
      location.replace(location.href);
    },
  },
};

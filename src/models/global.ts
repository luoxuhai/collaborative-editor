export default {
  namespace: 'global',

  state: {
    loginPaneVisible: false,
    logging: false,
  },

  subscriptions: {},

  reducers: {
    changeLoginPaneVisible(state: any, { payload }: any) {
      return {
        ...state,
        loginPaneVisible: payload,
      };
    },

    changeLogging(state: any, { payload }: any) {
      return {
        ...state,
        logging: payload,
      };
    },
  },
};

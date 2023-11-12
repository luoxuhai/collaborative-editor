export default {
  namespace: 'editor',

  state: {
    docInfo: {},
    docContent: {},
  },

  reducers: {
    changeDocInfo(state: any, { payload }: any) {
      return {
        ...state,
        docInfo: payload,
      };
    },

    changeDocContent(state: any, { payload }: any) {
      return {
        ...state,
        docContent: payload,
      };
    },
  },
};

import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  antd: {
    config: {
      '@primary-color': '#50976a',
    },
  },
  pwa: {
    src: 'manifest.json',
    manifest: {
      name: '实时协同编辑器',
    },
    hash: true,
    appStatusBar: '#fff',
  },
  routes: [
    { path: '/login', component: '@/pages/login' },
    {
      path: '/docs',
      component: '@/layouts/EditorLayout',
      routes: [{ path: ':id', component: '@/pages/editor' }],
    },
    {
      path: '/',
      component: '@/layouts/WorkspaceLayout',
      routes: [
        { path: '/', component: '@/pages/desktop' },
        { path: '/desktop', component: '@/pages/desktop' },
        { path: '/trash', component: '@/pages/trash' },
        { path: '/collaboration', component: '@/pages/collaboration' },
        { path: '/star', component: '@/pages/star' },
        { path: '/star/folder/:id', component: '@/pages/star' },
        { path: '/folder/:id', component: '@/pages/desktop' },
      ],
    },
    { path: '/welcome', component: '@/pages/welcome' },
  ],
  fastRefresh: {},
  locale: {},
  title: '实时协同编辑器',
  dva: {
    immer: true,
    hmr: false,
  },
});

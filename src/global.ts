import localforage from 'localforage';
import { getDvaApp } from 'umi';
import { notification } from 'antd';
import './global.less';

localforage.config({
  name: 'collaborative',
  driver: localforage.LOCALSTORAGE,
});

function initUserInfo() {
  localforage.getItem('user').then((value: any) => {
    const devApp = getDvaApp();
    if (value) {
      devApp._store.dispatch({
        type: 'login/setUserInfo',
        payload: { user: value.user, token: value.token },
      });

      devApp._store.dispatch({
        type: 'login/queryUserInfo',
        payload: value.token,
      });
    }
  });
}

initUserInfo();

if (
  /Android|webOS|iPhone|BlackBerry|Windows Phone/i.test(navigator.userAgent)
) {
  notification.warning({
    message: `温馨提示`,
    description: '请使用电脑浏览，以获得更好体验',
    placement: 'topLeft',
    duration: null,
  });
  window.isMobile = true;
} else window.isMobile = false;

window.addEventListener('sw.updated', (e) => {
  console.log('sw.updated');
  e.detail.update();
});

import Vue from 'vue';
import axios from 'axios';
import NitrozenSnackbar from '@gofynd/nitrozen-vue/src/components/NSnackbar';
import './styles/cms-ui.css';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(NitrozenSnackbar);
Vue.snackbar.register('show', (message) => message, {
  position: 'top-center',
  duration: 4000,
});
Vue.snackbar.register('showSuccess', (message) => message, {
  position: 'top-center',
  duration: 4000,
  type: 'success',
});
Vue.snackbar.register('showError', (message) => message, {
  position: 'top-center',
  duration: 5500,
  type: 'error',
});
Vue.snackbar.register('showWarning', (message) => message, {
  position: 'top-center',
  duration: 4000,
  type: 'warning',
});
Vue.snackbar.register('showInfo', (message) => message, {
  position: 'top-center',
  duration: 4000,
  type: 'info',
});

function extractAxiosErrorMessage(err) {
  const data = err.response && err.response.data;
  if (!data) {
    return err.message || 'Request failed';
  }
  if (typeof data.message === 'string') {
    return data.message;
  }
  if (Array.isArray(data.message)) {
    return data.message.map((m) => `${m}`).join(', ');
  }
  if (typeof data.error === 'string') {
    return data.error;
  }
  if (data.message && typeof data.message === 'object') {
    try {
      return JSON.stringify(data.message);
    } catch (e) {
      return 'Request failed';
    }
  }
  return err.message || 'Request failed';
}

axios.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.config && err.config.skipGlobalErrorToast) {
      return Promise.reject(err);
    }
    if (Vue.snackbar && typeof Vue.snackbar.showError === 'function') {
      Vue.snackbar.showError(extractAxiosErrorMessage(err));
    }
    return Promise.reject(err);
  },
);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

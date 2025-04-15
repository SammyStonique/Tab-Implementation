import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './index.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import DropZone from 'dropzone-vue';
import 'dropzone-vue/dist/dropzone-vue.common.css';
import IdleVue from 'idle-vue'
import { quillEditor } from 'vue3-quill'

//SweetAlert Options
const options = {
  confirmButtonColor: '#68D391',
  cancelButtonColor: '#ff7674',
};

//Toast options
const toastOptions = {
  position: 'top-right',
  timeout: 2000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: 'auto', // 'auto' shows the progress bar automatically
};


//Axios settings
function getCSRFToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrftoken=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

axios.defaults.baseURL = process.env.VUE_APP_API_URL
axios.defaults.withCredentials = true
// axios.defaults.headers.common['X-CSRFToken'] = getCookie('csrftoken');

// Add a request interceptor to include CSRF token
axios.interceptors.request.use(config => {
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  // Add Authorization header
  const authToken = store.state.token;
  if (authToken) {
    config.headers['Authorization'] = `Token ${authToken}`; 
  }
    return config;
  }, error => {
    return Promise.reject(error);
});

createApp(App).use(store).use(router).use(VueAxios, axios).use(Toast,toastOptions).use(VueSweetalert2, options).use(DropZone).use(IdleVue, {store, idleTime: 900000}).use(quillEditor).mount('#app')

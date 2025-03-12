<template>
    <Loader 
      :loader="loader"
      @showLoader="showLoader"
      @hideLoader="hideLoader"
    />
    <div class="login">
      <div class="w-full h-screen bg-[url('@/assets/image2.jpg')] bg-cover bg-center grid place-items-center">
        <div class="w-full sm:w-3/4 md:w-1/3 lg:w-1/3 h-auto bg-white p-4 rounded-lg shadow-lg">
          <div class="text-center grid place-items-center">
            <div class="flex justify-center mb-6">
              <div class="w-32 h-32 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-[url('@/assets/kalitech.png')] bg-cover bg-center" >
              </div>
            </div>
          </div>
          <div class="py-3 px-6">
            <form @submit.prevent="login">
              <div class="mb-4 flex flex-col sm:flex-row">
                <label for="email" class="sm:w-1/4 sm:text-right mb-2 sm:mb-0">Username:</label>
                <input type="text" id="email" class="sm:w-3/4 w-full ml-2 rounded-lg border-gray-300 border-2 p-2" v-model="email"placeholder="Enter your email">
              </div>
              <div class="mb-6 flex flex-col sm:flex-row">
                <label for="password" class="sm:w-1/4 sm:text-right mb-2 sm:mb-0">Password:</label>
                <input type="password" id="password" class="sm:w-3/4 w-full ml-2 rounded-lg border-gray-300 border-2 p-2" v-model="password"placeholder="Enter your password">
              </div>
              <div class="col-md-12 notification is-danger" v-if="errors.length">
                <p style="color: red;" v-for="error in errors" :key="error">{{ error }}</p>
              </div>
              <div class="mt-4 text-right">
                <button type="submit" class="bg-green-300 hover:bg-green-400 text-white px-6 py-2 rounded-lg w-32">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import { ref, defineComponent, onBeforeMount, onMounted } from 'vue';
  import { useStore } from "vuex";
  import { useToast } from "vue-toastification";
  import Loader from "@/components/Loader.vue";
  
  export default defineComponent({
    name: 'LoginView',
    components: {
      Loader
    },
    setup() {
      const store = useStore();
      const toast = useToast();
      const email = ref('');
      const password = ref('');
      const errors = ref([]);
      const loader = ref('none');
      const logo = ref('');
  
      const showLoader = () => {
        loader.value = "block";
      };
  
      const hideLoader = () => {
        loader.value = "none";
      };
  
      const login = () => {
        if(email.value == "" || password.value == ""){
          toast.error("Fill In The Required Fields");
        }else{
          showLoader();
        let formData = {
          email: email.value,
          password: password.value,
          device: 'Web'
        };
  
        axios.post('api/v1/auth-token/login/', formData)
          .then((response) => {
            if (response.status === 200) {
              toast.success(`Welcome Back, ${response.data.user_names}`);
              const userData = {
                user_id: response.data.user_id,
                company_id: response.data.company_id,
                device_id: response.data.device_id,
                user_names: response.data.user_names,
                user_profile: response.data.user_profile,
                company_name: response.data.company_name,
                system_timeout: response.data.system_timeout,
                token: response.data.token,
                isAuthenticated: true,
                activeComponent: "Main"
              };
              store.dispatch('userData/updateState', userData);
            } else {
              toast.error("Invalid Login Credentials");
            }
            // store.dispatch('userData/reloadPage');
          })
          .catch((error) => {
            if (error.response && error.response.status === 400) {
              toast.error("Invalid Login Credentials");
            } else {
              toast.error(error.message);
            }
          })
          .finally(() => {
            hideLoader();
  
          });
        }
        
      };
  
      return {
        email,password,errors,login,loader,showLoader,hideLoader
      };
    }
  });
  </script>
  
  <style scoped>
  /* Add custom styling if needed */
  </style>
  
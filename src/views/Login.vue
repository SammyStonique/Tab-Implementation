<template>
    <Loader 
        :loader="loader"
        @showLoader="showLoader"
        @hideLoader="hideLoader"
    />
    <div class="login">
        <div class="w-full h-screen bg-slate-700 grid place-items-center">
            <div class="w-1/2 h-100 bg-white p-4 rounded-lg">
                <div class="text-center grid place-items-center">
                    <div class="flex w-44">
                        <div class="w-36 h-36 rounded-full">
                            <img src="@/assets/kalitech.png" alt="Logo" class="object-cover w-full h-full">
                        </div>
                    </div>
                </div>
                <div class="py-3 px-8">
                    <form @submit.prevent="login" action="">
                        <div class="py-3 px-3 flex">
                            <div class="w-1/4 grid justify-items-end place-items-center">
                                <label for="">Username:</label>
                            </div>
                            <div class="w-3/4">
                                <input type="text" name="" id="" class="ml-4 w-3/4 rounded-lg border-gray-500 border-2 p-2 text-lg" v-model="email">
                            </div>
                        </div>
                        <div class="py-3 px-3 flex">
                            <div class="w-1/4 grid justify-items-end place-items-center">
                                <label for="">Password:</label>
                            </div>
                            <div class="w-3/4">
                                <input type="password" name="" id="" class="ml-4 w-3/4 rounded-lg border-gray-500 border-2 p-2 text-lg" v-model="password">
                            </div>
                        </div>
                        <div class="col-md-12 notification is-danger" v-if="errors.length">
                            <p style="color: red;" v-for="error in errors" v-bind:key="error">{{ error }}</p>
                        </div>
                        <div class="mt-3 grid justify-items-end">
                            <div class="pr-24">
                                <button class="bg-green-300 px-6 py-2 rounded-lg w-32">Login</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { ref, defineComponent } from 'vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import Loader from "@/components/Loader.vue";

export default defineComponent({
  name: 'LoginView',
  components:{
    Loader
  },
  setup(_,{emit}){
    const store = useStore();
    const toast = useToast();
    const email = ref('');
    const password = ref('');
    const errors = ref([]);
    const loader = ref('none');

    const showLoader = () =>{
        loader.value = "block";
    }

    const hideLoader = () =>{
        loader.value = "none";
    }

    const login = () =>{
        showLoader();
        let formData = {
            email: email.value,
            password: password.value
        }
        axios
        .post('api/v1/auth-token/login/', formData)
        .then((response)=>{
            console.log(response.data);
            if(response.status == 200){
                toast.success(`Welcome Back ${response.data.user_names}`)
                const userData = {
                    user_id: response.data.user_id,
                    company_id: response.data.company_id,
                    user_names: response.data.user_names,
                    user_profile: response.data.user_profile,
                    company_name: response.data.company_name,
                    token: response.data.token,
                    isAuthenticated: true,
                    activeComponent: "Main"
                }
                store.dispatch('userData/updateState',userData)
            }else{
                toast.error("Invalid Login Credentials")
            }
            
        })
        .catch((error)=>{
            console.log(error.message);
            if(error.response.status == 400){
                toast.error("Invalid Login Credentials") 
            }else{
                toast.error(error.message);
            }
            
        })
        .finally(()=>{
            hideLoader();
        })
    }
    return{
        email, password, errors, login, loader, showLoader, hideLoader
    }
  }

})
</script>
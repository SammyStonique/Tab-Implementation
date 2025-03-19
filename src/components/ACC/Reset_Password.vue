<template>
    <div class="">
        <Loader 
            :loader="loader"
            :containerWidth="containerWidth"
            :containerHeight="containerHeight"
            @showLoader="showLoader"
            @hideLoader="hideLoader"
        />
    </div>
    <div class="main-content z-10 bg-gray-100 px-4 py-4">
        <div class="subsection w-full flex justify-center items-center py-8">
            
            <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h4 class="text-2xl font-bold text-center mb-6">Password Change</h4>
                <form @submit.prevent="changePassword" class="space-y-4">
                
                <!-- Current Password -->
                <div class="flex flex-col">
                    <label for="currentPassword" class="text-sm font-medium mb-2">Current Password</label>
                    <div class="relative">
                        <input v-model="currentPassword" :type="currPassType ? 'text' : 'password'" id="currentPassword" 
                            :class="`bg-slate-50 rounded pl-3 border border-gray-300 text-sm w-full py-2`" 
                            placeholder="Current Password" required />
                        <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2" @click="showCurrPassword()">
                            <i class="fa fa-eye-slash" v-if="!currPassType"></i>
                            <i class="fa fa-eye" v-else></i>
                        </button>
                    </div>
                </div>

                <!-- New Password -->
                <div class="flex flex-col">
                    <label for="newPassword" class="text-sm font-medium mb-2">New Password</label>
                    <div class="relative">
                    <input v-model="newPassword" :type="passType ? 'text' : 'password'" id="newPassword"
                            :class="`bg-slate-50 rounded pl-3 pr-10 border border-gray-300 text-sm w-full py-2`"
                            placeholder="New Password" required />
                    <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2" @click="showPassword()">
                        <i class="fa fa-eye-slash" v-if="!passType"></i>
                        <i class="fa fa-eye" v-else></i>
                    </button>
                    </div>
                    <span v-if="watcherMsg.newPassword" class="text-red-500 text-xs mt-1">{{ watcherMsg.newPassword }}</span>
                </div>

                <!-- Confirm Password -->
                <div class="flex flex-col">
                    <label for="newPassword2" class="text-sm font-medium mb-2">Confirm Password</label>
                    <div class="relative">
                    <input v-model="newPassword2" :type="pass2Type ? 'text' : 'password'" id="newPassword2"
                            :class="`bg-slate-50 rounded pl-3 pr-10 border border-gray-300 text-sm w-full py-2`"
                            placeholder="Confirm Password" required />
                    <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2" @click="showPassword2()">
                        <i class="fa fa-eye-slash" v-if="!pass2Type"></i>
                        <i class="fa fa-eye" v-else></i>
                    </button>
                    </div>
                    <span v-if="watcherMsg.newPassword2" class="text-red-500 text-xs mt-1">{{ watcherMsg.newPassword2 }}</span>
                </div>

                <!-- Save Button -->
                <div class="flex justify-center">
                    <button type="submit" 
                            class="bg-green-500 text-white text-sm font-semibold rounded-full py-2 px-6 hover:bg-green-600 transition duration-300">
                    <i class="fa fa-check-circle text-xs mr-2" aria-hidden="true"></i>Save
                    </button>
                </div>
                
                </form>
            </div>
        </div>

    </div>
  </template>
  
<script>
import Loader from '@/components/Loader.vue';
import axios from 'axios';
import { ref, reactive, watch, computed } from 'vue';
import { useStore } from 'vuex';
import { useToast } from "vue-toastification";

export default {
  name: 'Reset_Password',
  components: {
        Loader
  },
  setup() {
    const store = useStore();
    const toast = useToast();
    const loader = ref("none");
    const title = ref('Inventory Management/ Dashboard');
    const companyID = computed(() => store.state.userData.company_id);
    const deviceID = computed(() => store.state.userData.device_id);
    const userID = computed(() => store.state.userData.user_id);
    const patientCount = ref(0);
    const appointmentCount = ref(0);
    const doctorCount = ref(0);
    const operationsCount = ref(0);
    const appointmentsArray = ref([]);
    const today_date = ref(new Date());
    const currentPassword = ref('');
    const newPassword = ref('');
    const newPassword2 = ref('');
    const showPass = ref(false);
    const passType = ref(false);
    const currPassType = ref(false);
    const showCurrPass = ref(false);
    const showPass2 = ref(false);
    const pass2Type = ref(false);
    const watcherMsg = reactive({
      newPassword: '',
      newPassword2: ''
    });

    // Watchers
    watch(newPassword, (value) => {
      validateNewPassword(value);
    });

    watch(newPassword2, (value) => {
      validatePassword2(value);
    });

    // Methods
    const validateNewPassword = (value) => {
      if (value.length === 0) {
        watcherMsg.newPassword = '';
      } else {
        if (value.length > 0 && value.length < 4) {
          watcherMsg.newPassword = 'Password is too short';
        } else {
          watcherMsg.newPassword = '';
        }
      }
    };

    const validatePassword2 = (value) => {
      if (value === newPassword.value) {
        watcherMsg.newPassword2 = '';
      } else {
        watcherMsg.newPassword2 = 'Passwords do not match';
      }
    };

    const showPassword = () => {
      showPass.value = !showPass.value;
      passType.value = showPass.value;
    };

    const showPassword2 = () => {
      showPass2.value = !showPass2.value;
      pass2Type.value = showPass2.value;
    };
    const showCurrPassword = () => {
      showCurrPass.value = !showCurrPass.value;
      currPassType.value = showCurrPass.value;
    };

    const changePassword = () => {
        showLoader()
        if(currentPassword.value == ""){
            toast.error("Current Password Is Missing!")
            hideLoader();
        }else{
            const formData = {
                user: userID.value,
                company: companyID.value,
                new_password: newPassword.value,
                old_password: currentPassword.value
            };

            axios.post('/api/v1/reset-user-password/', formData)
            .then((response) => {
                if(response.data.msg == "Success"){
                    toast.success('Password Changed Successfully');
                    newPassword.value = '';
                    newPassword2.value = '';
                    let formData = {
                        user_id: userID.value,
                        device_id: deviceID.value,
                    }
                    store.dispatch("userData/logout", formData);
                }else if(response.data.msg == "Incorrect"){
                    toast.error('Current Password Is Incorrect');
                }else if(response.data.msg == "User not found"){
                    toast.error('User not found');
                }
            })
            .catch((error) => {
                toast.error(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        
    };
    const showLoader = () =>{
        loader.value = "block";
    }
    const hideLoader = () =>{
        loader.value = "none";
    }

    return {
      title,companyID,patientCount,appointmentCount,doctorCount,operationsCount,appointmentsArray,today_date,newPassword,newPassword2,showPass,showCurrPassword,
      passType,showPass2,pass2Type,watcherMsg,validateNewPassword,validatePassword2,showPassword,showPassword2,changePassword,currentPassword,currPassType,
      showLoader, hideLoader, loader
    };
  }
};

</script>
<style scoped>
  
.main-content{
    z-index: -1;
    margin-left: 1px;
    margin-top: 40px;
    min-height: 90vh;
    overflow: hidden;
}
.subsection{
    min-height: 100vh;
}
.appointments-table{
    min-height: 40vh;
    max-height: 40vh;
    overflow-y: scroll;
}
</style>
  
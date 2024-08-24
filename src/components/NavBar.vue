<template>
  <div class="navbar flex z-30 h-10 top-0 w-full sticky-navbar bg-white border-b border-slate-300 shadow-sm shadow-slate-200 pl-6 py-0.5">
      <div class="w-1/4 flex">
          <div class="ml-2">
          <h4 class="text-sm font-bold uppercase py-2">{{company_name}}</h4>
          </div>               
      </div>
      <div class="w-2/4 py-2 flex">
          <div class="w-full">
          <h5 class="font-bold text-sm uppercase">{{title}}</h5>
          </div>
      </div>
      <div class="w-1/4 flex">
          <div class="w-1/4 grid justify-items-center">
          <i class="fa fa-bell text-xl" aria-hidden="true"></i>
          </div>
          <div class="w-3/4 flex">
          <div class="w-1/4 grid justify-items-end">
          </div>
          <div class="w-3/4 dropdown">
              <div class="flex">
              <div class="w-3/4" v-if="isAuthenticated">
                  <p class="font-bold text-sm">{{user_names}}</p>
                  <p class="text-xs">{{user_profile}}</p>
              </div>
              <div class="w-3/4" v-else>
                  <p class="font-bold text-sm">User Account</p>
                  <p></p>
              </div>
              <div class="w-1/4">
                  <button @click="showDropdown"><i class="fa fa-caret-down" aria-hidden="true"></i></button>
              </div>
              </div>
              <button class="fixed inset-0 bg-gray-50 opacity-25 cursor-default w-full" v-if="dropdown" @click="dropdown = !dropdown"></button>
              <div class="dropdown-content mt-1.5 absolute rounded bg-white w-44 py-3 px-3 shadow-md shadow-slate-500" v-if="dropdown">
                <router-link to="/my-account"><strong>My Account</strong></router-link><br />
                <button @click="logout"><strong>Logout</strong></button>
              </div>
          </div>
          </div>
      </div>
      <div class="pt-2">
        <TopBar @minimize="minimize" @close="close"/>
      </div>
  </div>
</template>

<script>
import { defineComponent, ref, onBeforeMount, computed} from 'vue';
import TopBar from './TopBar.vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'NavBar',
  props: {
      title:{
          type: String,
          required: true
      }
  },
  components:{
    TopBar
  },
  setup(_,{emit}){
      const store = useStore();
      const dropdown = ref(false);
      const companyID = computed(()=> store.state.userData.company_id);
      const isAuthenticated = computed(()=> store.state.userData.isAuthenticated);
      const userDetails = computed(()=> store.state.userData.userDetails);
      const company_name = computed(()=> store.state.userData.company_name);
      const user_names = computed(()=> store.state.userData.user_names);
      const user_profile = computed(()=> store.state.userData.user_profile);

      const getUserDetails = () =>{
          store.dispatch('userData/getUserDetails');
      }
      const fetchCompanyName = () =>{
          store.dispatch('userData/fetchCompanyName',companyID.value );
      }
      const showDropdown = () =>{
          dropdown.value = !dropdown.value;
      }
      const logout = () =>{
        store.dispatch("userData/logout");
      }
      const minimize = () =>{
        emit('minimize');
      }
      const close = () =>{
          emit('close')
      }
      onBeforeMount(()=>{
        //   getUserDetails();
        //   fetchCompanyName();
      })
      return{
          showDropdown,dropdown,isAuthenticated,userDetails,company_name,user_names,user_profile,logout,
          minimize, close
      }
  }
})

</script>

<style>
.navbar{
  z-index: 4001 !important;
}

</style>
<template>
    <em class="hidden">{{ isIdle }}</em>
    <component 
      :is="activeComponent"
    />
</template>

<script>
import axios from 'axios';
import Login from './views/Login.vue';
import Main from './views/Main.vue';
import { onBeforeMount, computed } from 'vue';
import { useStore } from 'vuex';

export default{
  components:{
    Login, Main
  },
  setup(){
    const store = useStore();
    const activeComponent = computed(() => store.state.userData.activeComponent);
    const deviceID = computed(() => store.state.userData.device_id);
    const userID = computed(() => store.state.userData.user_id);

    const isIdle = computed(() => {
        // Check if the user is idle
        const idleStatus = store.state.idleVue.isIdle;
        const companyID = store.state.userData.company_id;

        // Commit mutation if the user is idle
        if (idleStatus == true && companyID != "" && activeComponent != 'Login') {
          let formData = {
                user_id: userID.value,
                device_id: deviceID.value,
            }
            store.dispatch("userData/logout", formData);
        }

        return idleStatus;
    });

    onBeforeMount(()=>{
      // store.dispatch('userData/reloadPage');
      store.state.idleVue.isIdle = false;
      axios.get('api/v1/get-session-data/')
      .then((response)=>{
        if(response.status == 200){
          const userData = {
              user_id: response.data.user_id,
              device_id: response.data.device_id,
              company_id: response.data.company_id,
              user_names: response.data.user_names,
              user_profile: response.data.user_profile,
              company_name: response.data.company_name,
              token: response.data.token,
              isAuthenticated: true,
              activeComponent: "Main"
          }
          store.dispatch("userData/updateState",userData);
          if (response.data.token) {
            axios.defaults.headers.common["Authorization"] = "Token " + response.data.token;
          } else {
            axios.defaults.headers.common["Authorization"] = "";
          }
        }else{
          store.dispatch('userData/updateState',{activeComponent:"Login"})
        }
      })
      .catch((error)=>{
        console.log(error.message)
        store.dispatch('userData/updateState',{activeComponent:"Login"})
      })

    })
    return{
      activeComponent,isIdle
    }
  }
}
</script>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  // color: #2c3e50;
  color: #1f2b37;
  overflow: hidden;
}

nav {
  padding: 20px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.swal2-confirm-custom {
    background-color: #28a745; /* Green background for confirm button */
    color: #fff; /* White text color */
}

.swal2-cancel-custom {
    background-color: #dc3545; /* Red background for cancel button */
    color: #fff; /* White text color */
}

/* Optional: Customize other parts of the Swal */
.swal2-popup {
    font-family: Arial, sans-serif; /* Example of additional customization */
}
</style>

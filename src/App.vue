<template>
  <!-- <keep-alive>
    <router-view/>
  </keep-alive> -->
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
    const activeComponent = computed(() => store.state.userData.activeComponent)

    onBeforeMount(()=>{
      axios.get('api/v1/get-session-data')
      .then((response)=>{
        if(response.status == 200){
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
          console.log("THE USER DATAA IS ",userData)
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
      activeComponent
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
  padding: 30px;

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

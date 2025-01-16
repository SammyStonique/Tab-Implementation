<template>
  <div class="navbar flex z-30 h-12 top-0 w-full sticky-navbar bg-orange-400 border-b border-slate-300 shadow-sm shadow-slate-200 pl-6 py-1">
    <!-- Company Name Section -->
    <div class="w-full sm:w-1/4 flex items-center justify-between sm:justify-start">
      <h4 class="text-xs sm:text-sm font-bold uppercase py-2 ml-2">{{ company_name }}</h4>
    </div>

    <!-- Title Section -->
    <div class="w-full sm:w-2/4 py-2 flex justify-center sm:justify-start">
      <h5 class="font-bold text-xs sm:text-sm uppercase">{{ title }}</h5>
    </div>

    <!-- User Info and Notifications -->
    <div class="w-full sm:w-1/4 flex items-center justify-between sm:justify-end">
      <!-- Notifications Icon -->
      <div class="w-1/4 sm:w-1/4 grid justify-items-center sm:justify-items-start">
        <i class="fa fa-bell text-lg sm:text-xl" aria-hidden="true"></i>
      </div>

      <!-- User Info and Dropdown -->
      <div class="w-3/4 sm:w-3/4 flex">
        <div class="w-1/4 grid justify-items-end"></div>
        <div class="w-3/4 dropdown">
          <div class="flex">
            <div class="w-3/4 sm:w-3/4" v-if="isAuthenticated">
              <p class="font-bold text-xs sm:text-sm">{{ user_names }}</p>
              <p class="text-xs">{{ user_profile }}</p>
            </div>        
            <div class="w-3/4 sm:w-3/4" v-else>
              <p class="font-bold text-xs sm:text-sm">User Account</p>
            </div>

            <!-- Dropdown Button -->
            <button @click="showDropdown" class="ml-2">
              <i class="fa fa-caret-down text-sm sm:text-base" aria-hidden="true"></i>
            </button>
          </div>

          <!-- Overlay for Closing Dropdown -->
          <button class="fixed inset-0 bg-gray-50 opacity-15 cursor-default w-full sm:hidden z-40" v-if="dropdown" @click="dropdown = !dropdown"></button>

          <!-- Dropdown Content -->
          <div class="dropdown-content mt-2 absolute rounded bg-white w-44 py-3 px-3 shadow-md shadow-slate-500 z-50" v-if="dropdown">
            <router-link to="/my-account"><strong>My Account</strong></router-link><br />
            <button @click="logout"><strong>Logout</strong></button>
          </div>
        </div>
        
      </div>
    </div>
    
    <!-- TopBar Component -->
    <div class="pt-2 sm:pt-0">
      <TopBar @minimize="minimize" @close="close"/>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';
import TopBar from './TopBar.vue';

export default defineComponent({
  name: 'NavBar',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  components: {
    TopBar
  },
  setup(_, { emit }) {
    const store = useStore();
    const dropdown = ref(false);
    const isAuthenticated = computed(() => store.state.userData.isAuthenticated);
    const company_name = computed(() => store.state.userData.company_name);
    const user_names = computed(() => store.state.userData.user_names);
    const userID = computed(() => store.state.userData.user_id);
    const deviceID = computed(() => store.state.userData.device_id);
    const user_profile = computed(() => store.state.userData.user_profile);

    const showDropdown = () => {
      dropdown.value = !dropdown.value;
    };

    const logout = async () => {
            let formData = {
                user_id: userID.value,
                device_id: deviceID.value,
            }
            await store.dispatch("userData/logout", formData);
        };

    const minimize = () => {
      emit('minimize');
    };

    const close = () => {
      emit('close');
    };

    return {
      showDropdown,
      dropdown,
      isAuthenticated,
      company_name,
      user_names,
      user_profile,
      logout,
      minimize,
      close
    };
  }
});
</script>

<style scoped>
.navbar {
  z-index: 4001 !important;
}

@media (max-width: 640px) {
  .navbar {
    padding-left: 2rem; /* Adds padding to navbar on small screens */
  }
}
</style>

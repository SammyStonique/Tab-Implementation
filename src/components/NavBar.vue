<template>
    <div class="navbar flex z-30 h-12 top-0 w-full sticky-navbar bg-white border-b border-slate-300 shadow-sm shadow-slate-200 px-6 py-0.5">
    <div class="w-1/4 flex">
      <div class="ml-2">
        <h4 class="text-sm font-bold uppercase py-2">{{company_name}}</h4>
      </div>               
    </div>
    <div class="w-2/4 py-2 flex">
      <div class="w-full">
        <h5 class="font-bold text-lg">{{title}}</h5>
      </div>
    </div>
    <div class="w-1/4 flex">
      <div class="w-1/4 grid justify-items-center py-2">
        <i class="fa fa-bell text-2xl" aria-hidden="true"></i>
      </div>
      <div class="w-3/4 flex">
        <div class="w-1/4 grid justify-items-end">
          <div class="rounded-full h-10 w-10  mr-3 overflow-hidden border-2 border-white hover:border-2 hover:border-blue-400 hover:opacity-50 hover:shadow-2 hover:shadow-2xl">
              <button>
                <img :src="`${this.userDetails.image}`" alt="Profile Pic" class="w-full h-full object-cover"/>
              </button>
          </div>
        </div>
        <div class="w-3/4 pt-2 dropdown">
          <div class="flex">
            <div class="w-3/4" v-if="isAuthenticated">
              <p class="font-bold text-sm">{{this.userDetails.last_name}} {{ this.userDetails.first_name }}</p>
              <p class="text-xs">{{this.userDetails.profile}}</p>
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
          <div class="dropdown-content mt-3 absolute rounded bg-white w-44 py-3 px-3 shadow-md shadow-slate-500" v-if="dropdown">
            <router-link to="/my-account"><strong>My Account</strong></router-link><br />
            <router-link to="/login"><strong>Logout</strong></router-link>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>

<script>

export default{
  data(){
    return{
      userDetails: [],
      dropdown: false,
      company_name: "",
      companyID: "",
      company_logo: "",
    }
  },
  props:['title'],
  computed:{
    isAuthenticated(){
      return this.$store.state.isAuthenticated;
    }
  },
  methods:{
    getUserDetails(){
      this.axios
      .get("api/v1/users/me/")
      .then((response)=>{
        this.userDetails = response.data;
      })
      .catch((error)=>{
        console.log(error)
      })
    },
    showDropdown(){
      this.dropdown = !this.dropdown ;
    },
    fetchCompanyName(){
      this.axios
      .get(`api/v1/companies/${this.companyID}/`)
      .then((response)=>{
        this.company_name = response.data.name;
        this.company_logo = response.data.logo;
      })
      .catch((error)=>{
        console.log(error.message);
      })
    }
  },
  mounted(){
    this.fetchCompanyName();
    this.getUserDetails();

  }

}
</script>

<style>
.navbar{
  z-index: 4001 !important;
}

</style>
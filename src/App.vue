<template>
  <keep-alive>
    <router-view/>
  </keep-alive>
</template>

<script>
// import { useStore } from "vuex";
// import axios from 'axios';
export default{
  setup(){

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
</style>

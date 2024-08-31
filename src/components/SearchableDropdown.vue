<template>
    <div class="searchable-dropdown">
      <input type="text" v-model="searchQuery" @input="filterOptions" :placeholder="searchPlaceholder" class="rounded bg-slate-50 pl-3" :style="{width: this.dropdownWidth, height:this.dropdownHeight}">
      <button type="button" class="show-dropdown" @click="toggleDropdown" v-if="!dropdown_active"><i class="fa fa-caret-down" aria-hidden="true"></i></button>
      <button type="button" class="show-dropdown" @click="resetDropdown" v-else><i class="fa fa-times" aria-hidden="true"></i></button>
      <ul v-if="isOpen" class="dropdown-list capitalize bg-slate-50">
        <li v-for="(option, index) in filteredOptions" :key="index" @click="selectOption(option)" :style="{fontSize: this.fontSize}">
          {{ option }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted, onBeforeMount  } from 'vue';
  import { getCurrentInstance } from 'vue';
  export default defineComponent({
    props:{
        options:{
            type: Array,
            default: ()=> []
        },
        dropdownWidth:{
            type: String,
            required: true
        },
        dropdownHeight:{
            type: String,
            default: ()=> '28px'
        },
        fontSize:{
            type: String,
            default: ()=> '20px'
        },
        searchPlaceholder:{
            type: String,
            required: true
        },
        fontSize:{
            type: String,
            default: ()=> '12px'
        },
        updateValue:{
            type: String,
            default: ()=> ''
        },
        updateVal:{
            type: String,
            default: ()=> ''
        },
    },
    setup(_, {emit}){
        const {proxy} = getCurrentInstance();
        const isOpen = ref(false);
        const filteredOptions = ref([]);
        const dropdown_active = ref(false);
        const searchQuery = ref('');
        const toggleDropdown = () => {
            isOpen.value = true;
            if(isOpen.value){
                filteredOptions.value = proxy.options;
            }
            dropdown_active.value = true;
        }
        const selectOption = (option) => {
            searchQuery.value = option;
            toggleDropdown();
            emit('option-selected', option);
            isOpen.value = false;
        }
        const filterOptions = () => {
            dropdown_active.value = true;
            isOpen.value = true;
            filteredOptions.value = proxy.options.filter(option => {
            return option.toLowerCase().includes(searchQuery.value.toLowerCase());
            });
        }
        const resetDropdown = () =>{
            isOpen.value = false;
            searchQuery.value = "";
            dropdown_active.value = false;
            emit('clearSearch');
        }
        const fetchData = () =>{
          emit('fetchData');
        }
        onMounted(()=>{
          fetchData();
        })
        onBeforeMount(()=>{
          dropdown_active.value = false;
          searchQuery.value = proxy.updateValue;
        })
        return{
            isOpen, searchQuery, dropdown_active, filteredOptions, selectOption, filterOptions, resetDropdown, toggleDropdown
        }

    }
  });
  </script>
  
  <style scoped>
  .searchable-dropdown {
    position: relative;
    display: inline-block;
  }
  .searchable-dropdown input[type="text"] {
      width: 100%;
      padding: 2px;
      border: 1px solid rgb(156 163 175);
      border-radius: 4px;
  }
  .dropdown-list {
    position: absolute;
    top: 10;
    left: 10;
    text-align: left;
    z-index: 1;
    /* background-color: white; */
    border: 1px solid #ccc;
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    display:block
  }
  
  .dropdown-list li {
    padding: 3px;
    cursor: pointer;
    overflow: hidden;
  }
  
  .dropdown-list li:hover {
    /* background-color: #f0f0f0; */
    background-color: white;
  }
  .show-dropdown{
    float: right;
    margin-top: 3px;
    margin-left: -20px;
    position: absolute;
    /* z-index: 1; */
    cursor:pointer;
    border:0px;
    background-color: inherit;
    color:black;
}
.show-dropdown:focus{
    outline: none;
}
  </style>
  
import axios from "axios";
import Swal from 'sweetalert2';
import { useToast } from "vue-toastification";

const toast = useToast();

const state = {
  itemsList: [], 
  itemsSaleList: [],
  itemsArr: [],
  itemsArray: [],
  lineItemsArray: [],
  itemID: null,
  itemName: '',
  item_name_search: '',
  item_code_search: '',
  stock_type_search: '',
  property_type_search: '',
  selectedItem: null,
  selectedCategory: null,
  selectedUom: null,
  selectedVendor: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.itemsList = [];
    state.itemsSaleList = [];
    state.itemsArr = [];
    state.itemsArray = [];
    state.lineItemsArray = [];
    state.itemID = null;
    state.itemName = null;
    state.item_name_search = '';
    state.item_code_search = '';
    state.stock_type_search = '';
    state.property_type_search = '';
    state.isEditing = false;
    state.selectedItem = null;
    state.selectedCategory = null;
    state.selectedUom = null;
    state.selectedVendor = null;
  },
  SET_SELECTED_ITEM(state, item) {
    state.selectedItem = item;
    state.isEditing = true;
  },
  LIST_ITEMS(state, items) {
    state.itemsList = items;
  },
  LIST_SALE_ITEMS(state, items) {
    state.itemsSaleList = items;
  },
  ITEMS_ARRAY(state, items){
    state.propArray = items;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category;
  },
  SET_SELECTED_UOM(state, uom) {
    state.selectedUom = uom;
  },
  SET_SELECTED_VENDOR(state, vendor) {
    state.selectedVendor = vendor;
  },
  SET_STATE(state, payload) {
    for (const key in payload) {
        if (payload.hasOwnProperty(key) && key in state) {
            state[key] = payload[key];
        }
    }
  },
  SET_SEARCH_FILTERS(state, search_filter){
    for(const [key, value] of Object.entries(search_filter)){
      if(key == 'item_name_search'){
        state.item_name_search = value;
      }else if(key == 'item_code_search'){
        state.item_code_search = value;
      }else if(key == 'stock_type_search'){
          state.stock_type_search = value;
      }else if(key == 'property_type_search'){
          state.property_type_search = value;
      }   
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.item_name_search = '';
    state.item_code_search = '';
    state.stock_type_search = '';
    state.property_type_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createInventoryItem({ commit,state }, formData) {
    return axios.post('api/v1/create-inventory-item/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  async fetchInventoryItems({ commit,state }, formData) {
    state.itemsArr = [];
    await axios.post(`api/v1/fetch-inventory-items/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.itemsArr.push((response.data[i].item_code + ' - ' + response.data[i].item_name))
      }
      commit('LIST_ITEMS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  async fetchItems({ commit,state }, formData) {
    state.itemsArr = [];
    await axios.post(`api/v1/custom-stock-adjustment-item-search/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.items.length; i++){
        state.itemsArr.push((response.data.items[i].inventory_item_code + ' - ' + response.data.items[i].inventory_item_name))
      }
      commit('LIST_SALE_ITEMS', response.data.items);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchInventoryItem({ commit,state }, formData) {
    axios.post(`api/v1/fetch-inventory-items/`,formData)
    .then((response)=>{
      const selectedCategory =response.data.item_category.category_name;
      const selectedUom = response.data.unit_of_measure.uom_name;
      const selectedVendor = response.data.preferred_vendor ?  response.data.preferred_vendor.vendor_code + " - " + response.data.preferred_vendor.vendor_name : null;
      commit('SET_SELECTED_CATEGORY',selectedCategory);
      commit('SET_SELECTED_UOM',selectedUom);
      commit('SET_SELECTED_VENDOR',selectedVendor);
      state.selectedItem = response.data;
      commit('SET_SELECTED_ITEM',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedInventoryItem({ commit, state }, option){
    state.itemsArray = [];
    console.log("THE OPTION IS ",option)
    const selectedItem = state.itemsList.find(item => (item.item_code + " - " +item.item_name) === option);
    if (selectedItem) {
        console.log("THE selectedItem IS ",option)
        state.itemID = selectedItem.inventory_item_id;
        state.itemName = selectedItem.item_code + " - " + selectedItem.item_name;
        state.itemsArray = [...state.itemsArray, selectedItem];
    }
    commit('ITEMS_ARRAY', state.itemsArray);
      
  },
  handleSelectedItem({ commit, state }, option){
    state.itemsArray = [];
    const selectedItem = state.itemsSaleList.find(item => (item.inventory_item_code + ' - ' + item.inventory_item_name) === option);
    if (selectedItem) {
        selectedItem.item = selectedItem.inventory_item_id;
        selectedItem.batch_count = selectedItem.batch_count;
        selectedItem.stock_at_hand = selectedItem.batch_after_sale;
        selectedItem.quantity = 1;
        selectedItem.cost = parseFloat(selectedItem.selling_price);
        selectedItem.discount = 0;
        selectedItem.vat_rate = null;
        selectedItem.vat_inclusivity = "Inclusive";
        selectedItem.vat_amount = 0;
        selectedItem.sub_total = 0;
        selectedItem.total_amount = selectedItem.quantity * selectedItem.cost;
        selectedItem.available_batch_count = selectedItem.batch_before_sale,
        selectedItem.item_sales_income = (parseFloat(selectedItem.selling_price) - parseFloat(selectedItem.selling_price)) * 1,
        state.itemsArray = [...state.itemsArray, selectedItem];
    }
    let itemExists = false;
    for (let i=0; i< state.lineItemsArray.length; i++){
      if(state.lineItemsArray[i] == selectedItem){
        itemExists = true;
        break;
      }
    }
    if(itemExists == false){
      state.lineItemsArray.push(selectedItem)
    }else{
      toast.error("Item Already Selected")
    }
    
    commit('ITEMS_ARRAY', state.itemsArray);
      
  },

  async updateInventoryItem({ commit,state }, formData) {
    return axios.put(`api/v1/update-inventory-item/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteInventoryItem({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Inventory Item?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Item!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-inventory-item/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Item removed succesfully!", {
                icon: "success",
              }); 
          }else{
            Swal.fire({
              title: "Cannot Delete Sold Item",
              icon: "warning",
            });
          }                   
        })
        .catch((error)=>{
          console.log(error.message);
          Swal.fire({
            title: error.message,
            icon: "warning",
          });
        })
      }else{
        Swal.fire(`Inventory Item has not been deleted!`);
      }
    })
  },
  removeItemLine({commit, state}, index){
    state.lineItemsArray.splice(index, 1); 
  },
};
  
const getters = {
  // users: (state) => state.users,
  // currentUser: (state) => state.currentUser,
};
  
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
  
  
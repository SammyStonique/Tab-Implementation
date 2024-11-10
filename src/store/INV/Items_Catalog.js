import axios from "axios";
import Swal from 'sweetalert2';
import { useToast } from "vue-toastification";

const toast = useToast();

const state = {
  itemsList: [], 
  itemsSaleList: [],
  saleOrderItems: [],
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
    state.saleOrderItems = [];
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
  LIST_SALE_ORDER_ITEMS(state, sales) {
    state.saleOrderItems = sales;
  },
  LIST_PURCHASE_ORDER_ITEMS(state, purchases) {
    state.purchaseOrderItems = purchases;
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
  async fetchItemsWithStock({ commit,state }, formData) {
    state.itemsArr = [];
    await axios.post(`api/v1/item-with-stock-search/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.items.length; i++){
        state.itemsArr.push((response.data.items[i].item_code + ' - ' + response.data.items[i].item_name))
      }
      commit('LIST_ITEMS', response.data.items);
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
  fetchSaleOrderItems({ commit,state }, formData) {
    axios.post(`api/v1/inventory-sale-items-search/`,formData)
    .then((response)=>{
      const saleOrderItems = response.data.saleItems;
      commit('LIST_SALE_ORDER_ITEMS',saleOrderItems);
      for(let i=0; i< saleOrderItems.length; i++){
        let obj = {
            item_batch_id: saleOrderItems[i].item_batch,
            item_batch_data: saleOrderItems[i].item_batch_data,
            item: saleOrderItems[i].inventory_item_id, 
            stock_at_hand: saleOrderItems[i].batch_after_sale, 
            quantity: saleOrderItems[i].quantity, 
            discount: saleOrderItems[i].discount, 
            purchase_price: Number(saleOrderItems[i].purchase_price), 
            selling_price: Number(saleOrderItems[i].selling_price), 
            sub_total: Number(saleOrderItems[i].total_amount) - Number(saleOrderItems[i].tax),
            item_name: saleOrderItems[i].inventory_item_name,
            inventory_item_name: saleOrderItems[i].inventory_item_name,
            stock_after_adjustment: saleOrderItems[i].batch_after_sale - saleOrderItems[i].quantity,
            selected_vat: {
                "tax_rate": saleOrderItems[i].tax_rate,
                "tax_output_id": saleOrderItems[i].tax_output_id,
                "tax_id": saleOrderItems[i].tax_id,
                "tax_name": saleOrderItems[i].tax_name,
            },
            vat_rate: {
              text: (saleOrderItems[i].tax_name),
              value: {
                "tax_rate": saleOrderItems[i].tax_rate,
                "tax_output_id": saleOrderItems[i].tax_output_id,
                "tax_id": saleOrderItems[i].tax_id,
                "tax_name": saleOrderItems[i].tax_name,
              },
            },
            output_vat_id: saleOrderItems[i].tax_output_id,
            vat_inclusivity: saleOrderItems[i].tax_inclusivity,
            tax_id: saleOrderItems[i].tax_id,
            vat_amount: saleOrderItems[i].tax,
            total_amount: Number(saleOrderItems[i].total_amount),
            batch_count: saleOrderItems[i].batch_after_sale,
            batch_before_sale: saleOrderItems[i].batch_before_sale,
            batch_after_sale: saleOrderItems[i].batch_after_sale,
            available_batch_count: saleOrderItems[i].batch_before_sale,
            item_sales_income: (Number(saleOrderItems[i].selling_price) - Number(saleOrderItems[i].purchase_price)) * saleOrderItems[i].quantity
        }
        state.lineItemsArray.push(obj)
      }

    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchPurchaseOrderItems({ commit,state }, formData) {
    axios.post(`api/v1/inventory-sale-items-search/`,formData)
    .then((response)=>{
      const purchaseOrderItems = response.data.saleItems;
      commit('LIST_PURCHASE_ORDER_ITEMS',purchaseOrderItems);
      for(let i=0; i< purchaseOrderItems.length; i++){
        let obj = {
            item_batch_id: purchaseOrderItems[i].item_batch_data,
            item: purchaseOrderItems[i].inventory_item_id, 
            quantity: purchaseOrderItems[i].quantity, 
            discount: purchaseOrderItems[i].discount, 
            cost: Number(purchaseOrderItems[i].purchase_price), 
            selling_price: Number(purchaseOrderItems[i].selling_price), 
            sub_total: Number(purchaseOrderItems[i].total_amount) - Number(purchaseOrderItems[i].tax),
            item_name: purchaseOrderItems[i].inventory_item_name,
            inventory_item_name: purchaseOrderItems[i].inventory_item_name,
            stock_after_adjustment: purchaseOrderItems[i].batch_after_sale - purchaseOrderItems[i].quantity,
            selected_vat: {
                "tax_rate": purchaseOrderItems[i].tax_rate,
                "tax_input_id": purchaseOrderItems[i].tax_input_id,
                "tax_id": purchaseOrderItems[i].tax_id,
                "tax_name": purchaseOrderItems[i].tax_name,
            },
            vat_rate: {
              text: (purchaseOrderItems[i].tax_name),
              value: {
                "tax_rate": purchaseOrderItems[i].tax_rate,
                "tax_input_id": purchaseOrderItems[i].tax_input_id,
                "tax_id": purchaseOrderItems[i].tax_id,
                "tax_name": purchaseOrderItems[i].tax_name,
              },
            },
            input_vat_id: purchaseOrderItems[i].tax_input_id,
            vat_inclusivity: purchaseOrderItems[i].tax_inclusivity,
            tax_id: purchaseOrderItems[i].tax_id,
            vat_amount: purchaseOrderItems[i].tax,
            total_amount: Number(purchaseOrderItems[i].total_amount),
        }
        state.lineItemsArray.push(obj)
      }

    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleSelectedInventoryItem({ commit, state }, option){
    state.itemsArray = [];
    const selectedItem = state.itemsList.find(item => (item.item_code + " - " +item.item_name) === option);
    if (selectedItem) {
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
        selectedItem.item_sales_income = (parseFloat(selectedItem.selling_price) - parseFloat(selectedItem.purchase_price)) * 1,
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

  handleSelectedPurchaseItem({ commit, state }, option){
    state.itemsArray = [];
    const selectedItem = state.itemsList.find(item => (item.item_code + ' - ' + item.item_name) === option);
    if (selectedItem) {
        selectedItem.item = selectedItem.inventory_item_id;
        selectedItem.quantity = 1;
        selectedItem.cost = parseFloat(selectedItem.default_purchase_price);
        selectedItem.selling_price = parseFloat(selectedItem.default_selling_price);
        selectedItem.purchase_price = parseFloat(selectedItem.default_purchase_price);
        selectedItem.discount = 0;
        selectedItem.vat_rate = null;
        selectedItem.vat_inclusivity = "Inclusive";
        selectedItem.vat_amount = 0;
        selectedItem.sub_total = parseFloat(selectedItem.default_purchase_price);
        selectedItem.total_amount = selectedItem.quantity * selectedItem.cost;
        selectedItem.batch_count = 10000000,
        selectedItem.input_vat_id = null;
        selectedItem.item_sales_income = (parseFloat(selectedItem.selling_price) - parseFloat(selectedItem.purchase_price)) * 1;

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
  
  
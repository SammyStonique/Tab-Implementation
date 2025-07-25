import axios from "axios";
import Swal from 'sweetalert2';
import PrintJS from 'print-js';
import { useToast } from "vue-toastification";

const toast = useToast();

const state = {
  journalsList: [], 
  journalsClientList: [], 
  inventoryRcptList: [],
  inventoryPvList: [],
  accountsRcptList: [],
  accountsPvList: [],
  journalArr: [],
  journalArray: [],
  journalsArray: [],
  tenantInvoices: [],
  customerInvoices: [],
  vendorBills: [],
  tenantReceipts: [],
  customerReceipts: [],
  outstandingBalance: 0,
  invoiceDueAmount: 0,
  invoiceDescription: "",
  jnlArray: [],
  jnlSortedArr: [],
  journalID: '',
  journalNo: '',
  journal_no_search: "",
  description_search: '',
  min_amount_search: '',
  max_amount_search: '',
  client_name_search: '',
  client_code_search: '',
  from_date_search: '',
  to_date_search: '',
  selectedLedger: null,
  selectedJournal: null,
  isEditing: false
};
  
const mutations = {
  initializeStore(state){
    state.journalsList = [];
    state.journalsClientList = [];
    state.inventoryRcptList = [];
    state.inventoryPvList = [];
    state.accountsRcptList = [];
    state.accountsPvList = [];
    state.journalArr = [];
    state.journalArray = [];
    state.journalsArray = [];
    state.jnlArray = [];
    state.jnlSortedArr = [];
    state.tenantInvoices = [];
    state.customerInvoices = [];
    state.tenantReceipts = [];
    state.vendorBills = [];
    state.customerReceipts = [];
    state.outstandingBalance = 0;
    state.invoiceDescription = "";
    state.invoiceDueAmount = 0;
    state.journalID = '';
    state.journalNo = '';
    state.client_name_search = '';
    state.client_code_search = '';
    state.from_date_search = '';
    state.to_date_search = '';
    state.journal_no_search = '';
    state.description_search = '';
    state.min_amount_search = '';
    state.max_amount_search = '';
    state.selectedJournal = null;
    state.selectedLedger = null;
    state.isEditing = false;
  },
  SET_SELECTED_JOURNAL(state, journal) {
    state.selectedJournal = journal;
    state.isEditing = true;
  },
  LIST_JOURNALS(state, journals) {
    state.journalsList = journals;
  },
  LIST_JOURNALS_CLIENT(state, journals) {
    state.journalsClientList = journals;
  },
  LIST_INVENTORY_INVOICES(state, journals) {
    state.inventoryRcptList = journals;
  },
  LIST_INVENTORY_BILLS(state, journals) {
    state.inventoryPvList = journals;
  },
  LIST_ACCOUNTS_INVOICES(state, journals) {
    state.accountsRcptList = journals;
  },
  LIST_ACCOUNTS_BILLS(state, journals) {
    state.accountsPvList = journals;
  },
  CLIENT_OUTSTANDING_AMOUNT(state, amount){
    state.outstandingBalance = amount;
  },
  LIST_TENANTS_INVOICES(state, journals) {
    state.tenantInvoices = journals;
  },
  LIST_CUSTOMERS_INVOICES(state, journals) {
    state.customerInvoices = journals;
  },
  LIST_TENANTS_RECEIPTS(state, journals) {
    state.tenantReceipts = journals;
  },
  LIST_VENDOR_BILLS(state, journals) {
    state.vendorBills = journals;
  },
  LIST_CUSTOMERS_RECEIPTS(state, journals) {
    state.customerReceipts = journals;
  },
  JOURNALS_ARRAY(state, journals){
    state.journalArray = journals;
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
      if(key == 'client_name_search'){
        state.client_name_search = value;
      }else if(key == 'client_code_search'){
        state.client_code_search = value;
      }else if(key == 'from_date_search'){
        state.from_date_search = value;
      }else if(key == 'to_date_search'){
        state.to_date_search = value;
      }else if(key == 'journal_no_search'){
        state.journal_no_search = value;
      }else if(key == 'description_search'){
        state.description_search = value;
      }else if(key == 'min_amount_search'){
        state.min_amount_search = value;
      }else if(key == 'max_amount_search'){
        state.max_amount_search = value;
      }
    }
  },
  RESET_SEARCH_FILTERS(state){
    state.client_name_search = '';
    state.client_code_search = '';
    state.from_date_search = '';
    state.to_date_search = '';
    state.journal_no_search = '';
    state.description_search = '';
    state.min_amount_search = '';
    state.max_amount_search = '';
  }
};
  
const actions = {
  updateState({ commit }, newState) {
    commit('SET_STATE', newState);
  },
  
  async createJournal({ commit,state }, formData) {
    return axios.post('api/v1/create-journal/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },
  async createTenantReceipt({ commit,state }, formData) {
    return axios.post('api/v1/create-tenant-receipt/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },
  async createCustomerReceipt({ commit,state }, formData) {
    return axios.post('api/v1/create-customer-receipt/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },
  async createPaymentVoucher({ commit,state }, formData) {
    return axios.post('api/v1/create-payment-voucher/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },
  async bookTenantInvoices({ commit,state }, formData) {
    return axios.post('api/v1/book-rental-invoices/', formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })
  },

  fetchJournals({ commit,state }, formData) {
    state.journalArr = [];
    axios.post(`api/v1/fetch-journals/`,formData)
    .then((response)=>{
      for(let i=0; i< response.data.length; i++){
        state.journalArr.push((response.data[i].journal_no + " - " + response.data[i].description + " - " + response.data[i].due_amount));
      }
      commit('LIST_JOURNALS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  handleClientPrepayment({commit,state}, formData){
    state.journalsClientList.push(formData);
    commit('LIST_JOURNALS_CLIENT', state.journalsClientList);
  },
  fetchJournalsClient({ commit,state }, formData) {
    state.outstandingBalance = 0;
    axios.post(`api/v1/fetch-journals/`,formData)
    .then((response)=>{
      const clientInvoices = response.data;
      for(let i=0; i<response.data.length; i++){
        state.outstandingBalance += Number(response.data[i].due_amount);
      }
      const transformedInvoiceArray = clientInvoices.map(clientInvoice =>({
          ...clientInvoice,
          payment_allocation: 0,
          quantity: 1,
          cost: clientInvoice.total_amount,
          bal_after_alloc: "",
          allocation_status: false
      }));
      commit('LIST_JOURNALS_CLIENT', transformedInvoiceArray);
      commit('CLIENT_OUTSTANDING_AMOUNT', state.outstandingBalance);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchInventoryInvoices({ commit,state }, formData) {
    state.outstandingBalance = 0;
    axios.post(`api/v1/fetch-journals/`,formData)
    .then((response)=>{
      const clientInvoices = response.data;
      for(let i=0; i<response.data.length; i++){
        state.outstandingBalance += Number(response.data[i].due_amount);
      }
      const transformedInvoiceArray = clientInvoices.map(clientInvoice =>({
          ...clientInvoice,
          payment_allocation: 0,
          bal_after_alloc: "",
          allocation_status: false
      }));
      commit('LIST_INVENTORY_INVOICES', transformedInvoiceArray);
      commit('CLIENT_OUTSTANDING_AMOUNT', state.outstandingBalance);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchInventoryBills({ commit,state }, formData) {
    state.outstandingBalance = 0;
    axios.post(`api/v1/fetch-journals/`,formData)
    .then((response)=>{
      const clientInvoices = response.data;
      for(let i=0; i<response.data.length; i++){
        state.outstandingBalance += Number(response.data[i].due_amount);
      }
      const transformedInvoiceArray = clientInvoices.map(clientInvoice =>({
          ...clientInvoice,
          payment_allocation: 0,
          bal_after_alloc: "",
          allocation_status: false
      }));
      commit('LIST_INVENTORY_BILLS', transformedInvoiceArray);
      commit('CLIENT_OUTSTANDING_AMOUNT', state.outstandingBalance);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAccountsInvoices({ commit,state }, formData) {
    state.outstandingBalance = 0;
    axios.post(`api/v1/fetch-journals/`,formData)
    .then((response)=>{
      const clientInvoices = response.data;
      for(let i=0; i<response.data.length; i++){
        state.outstandingBalance += Number(response.data[i].due_amount);
      }
      const transformedInvoiceArray = clientInvoices.map(clientInvoice =>({
          ...clientInvoice,
          payment_allocation: 0,
          bal_after_alloc: "",
          allocation_status: false
      }));
      commit('LIST_ACCOUNTS_INVOICES', transformedInvoiceArray);
      commit('CLIENT_OUTSTANDING_AMOUNT', state.outstandingBalance);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchAccountsBills({ commit,state }, formData) {
    state.outstandingBalance = 0;
    axios.post(`api/v1/fetch-journals/`,formData)
    .then((response)=>{
      const clientInvoices = response.data;
      for(let i=0; i<response.data.length; i++){
        state.outstandingBalance += Number(response.data[i].due_amount);
      }
      const transformedInvoiceArray = clientInvoices.map(clientInvoice =>({
          ...clientInvoice,
          payment_allocation: 0,
          bal_after_alloc: "",
          allocation_status: false
      }));
      commit('LIST_ACCOUNTS_BILLS', transformedInvoiceArray);
      commit('CLIENT_OUTSTANDING_AMOUNT', state.outstandingBalance);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchJournal({ commit,state }, formData) {
    axios.post(`api/v1/fetch-journals/`,formData)
    .then((response)=>{
      state.selectedJournal = response.data;
      commit('SET_SELECTED_JOURNAL',response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchTenantsInvoices({ commit,state }, formData) {
    axios.post(`api/v1/client-category-journals-search/`,formData)
    .then((response)=>{
      commit('LIST_TENANTS_INVOICES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchCustomersInvoices({ commit,state }, formData) {
    axios.post(`api/v1/client-category-journals-search/`,formData)
    .then((response)=>{
      commit('LIST_CUSTOMERS_INVOICES', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchVendorBills({ commit,state }, formData) {
    axios.post(`api/v1/client-category-journals-search/`,formData)
    .then((response)=>{
      commit('LIST_VENDOR_BILLS', response.data);
    })
    .catch((error)=>{
      console.log(error.message);
    })
    
  },
  fetchClientJournals({ commit,state }, formData){
    state.journalsArray = [];
    axios
    .post("api/v1/client-journals-search/", formData)
    .then((response)=>{
        state.jnlArray = [];
        let running_balance = 0;
        state.journalsArray = response.data.results;
        state.jnlSortedArr = state.journalsArray.sort(function(a, b){
            // Convert the date strings to Date objects
            let dateA = new Date(a.date);
            let dateB = new Date(b.date);

            // Subtract the dates to get a value that is either negative, positive, or zero
            return dateA - dateB;
        })

        for(let i=0; i<state.journalsArray.length; i++){
            if(state.journalsArray[i].debit_amount != 0){
                running_balance += state.journalsArray[i].debit_amount;
                state.journalsArray[i]['running_balance'] = Number(running_balance).toLocaleString();
                state.jnlArray.push(state.journalsArray[i])
            }
            else if(state.journalsArray[i].credit_amount != 0){
                running_balance -= state.journalsArray[i].credit_amount;
                state.journalsArray[i]['running_balance'] = Number(running_balance).toLocaleString();
                state.jnlArray.push(state.journalsArray[i])
            }
        }
    })
    .catch((error)=>{
        console.log(error.message)
    })
    .finally(()=>{
    
    })
  },
  handleSelectedJournal({ commit, state }, option){
    state.journalArray = [];
    const selectedJournal = state.journalsList.find(journal => (journal.journal_no + " - " +journal.description + " - " +journal.due_amount) === option);
    if (selectedJournal) {
      const journalCopy = JSON.parse(JSON.stringify(selectedJournal));
      state.journalID = journalCopy.journal_id;
      state.journalNo = journalCopy.journal_no;
      state.invoiceDescription = journalCopy.description;
      state.invoiceDueAmount = journalCopy.due_amount;
      state.journalArray = [...state.journalArray, journalCopy];

      commit('JOURNALS_ARRAY', state.journalArray);
    }
      
  },

  async updateJournal({ commit,state }, formData) {
    return axios.put(`api/v1/update-journal/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  async moveJournalEntry({ commit,state }, formData) {
    return axios.post(`api/v1/move-journal-entry/`,formData)
    .then((response)=>{
      return response;
    })
    .catch((error)=>{
      console.log(error.message);
      throw error;
    })  
  },

  deleteInvoice({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Invoice?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Invoice!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-journal/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Invoice(s) removed succesfully!", {
                icon: "success",
              }); 
          }else if(response.data.msg == "Paid"){
            Swal.fire({
              title: "Cannot Delete Paid Invoice",
              icon: "warning",
            });
          }else if(response.data.msg == "Prepayment"){
            Swal.fire({
              title: "Invoice Has A Prepayment Allocation",
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
        Swal.fire(`Invoice has not been deleted!`);
      }
    })
  },
  deleteReceipt({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Receipt?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Receipt!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-journal/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Receipt(s) removed succesfully!", {
                icon: "success",
              }); 
              toast.success("Receipt(s) removed succesfully")
          }else if(response.data.msg == "Reversed"){
            Swal.fire({
              title: "Cannot Delete Reversed Receipt",
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
        Swal.fire(`Receipt has not been deleted!`);
      }
    })
  },
  deleteBill({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Bill?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Bill!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-journal/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Bill(s) removed succesfully!", {
                icon: "success",
              }); 
          }else if(response.data.msg == "Paid"){
            Swal.fire({
              title: "Cannot Delete Paid Bill",
              icon: "warning",
            });
          }else if(response.data.msg == "Prepayment"){
            Swal.fire({
              title: "Bill Has A Prepayment Allocation",
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
        Swal.fire(`Bill has not been deleted!`);
      }
    })
  },
  deletePaymentVoucher({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Payment Voucher?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Payment Voucher!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-journal/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Payment Voucher(s) removed succesfully!", {
                icon: "success",
              }); 
              toast.success("Payment Voucher(s) removed succesfully")
          }else if(response.data.msg == "Failed"){
            Swal.fire({
              title: "Cannot Delete Payment Voucher",
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
        Swal.fire(`Payment Voucher has not been deleted!`);
      }
    })
  },
  deleteJournal({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Journal?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Journal!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-journal/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Journal(s) removed succesfully!", {
                icon: "success",
              }); 
          }else if(response.data.msg == "Failed"){
            Swal.fire({
              title: "Cannot Delete Journal",
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
        Swal.fire(`Journal has not been deleted!`);
      }
    })
  },
  deleteDebitNote({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Debit Note?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Debit Note!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-journal/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Debit Note(s) removed succesfully!", {
                icon: "success",
              }); 
          }else if(response.data.msg == "Paid"){
            Swal.fire({
              title: "Cannot Delete Paid Debit Note",
              icon: "warning",
            });
          }else if(response.data.msg == "Prepayment"){
            Swal.fire({
              title: "Debit Note Has A Prepayment Allocation",
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
        Swal.fire(`Debit Note has not been deleted!`);
      }
    })
  },
  deleteCreditNote({ commit,state }, formData) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you wish to delete Credit Note?`,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes Delete Credit Note!',
      cancelButtonText: 'Cancel!',
      customClass: {
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom',
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        axios.post(`api/v1/delete-journal/`,formData)
        .then((response)=>{
          if(response.data.msg == "Success"){
              Swal.fire("Poof! Credit Note(s) removed succesfully!", {
                icon: "success",
              }); 
              toast.success("Credit Note(s) removed succesfully")
          }else{
            Swal.fire({
              title: "Cannot Delete Credit Note",
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
        Swal.fire(`Credit Note has not been deleted!`);
      }
    })
  },
  previewClientInvoice({commit,state}, formData){
    axios
    .post(`api/v1/client-invoice-pdf/`, formData, { responseType: 'blob' })
    .then((response) => {
      if(response.status == 200){
        const blob1 = new Blob([response.data]);
        // Convert blob to URL
        const url = URL.createObjectURL(blob1);
        PrintJS({printable: url, type: 'pdf'});
    }
    
    })
    .catch((error)=>{
        console.log(error.message);
    })
  },
  downloadClientInvoice({commit,state}, formData){
    axios
    .post(`api/v1/client-invoice-pdf/`, formData, { responseType: 'blob' })
    .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Customer Invoice.pdf');
        document.body.appendChild(link);
        link.click();
    }
    
    })
    .catch((error)=>{
        console.log(error.message);
    })
  },
  downloadVendorBill({commit,state}, formData){
    axios
    .post(`api/v1/client-invoice-pdf/`, formData, { responseType: 'blob' })
    .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Vendor Bill.pdf');
        document.body.appendChild(link);
        link.click();
    }
    
    })
    .catch((error)=>{
        console.log(error.message);
    })
  },
  previewClientReceipt({commit,state}, formData){
    axios
    .post(`api/v1/client-receipt-pdf/`, formData, { responseType: 'blob' })
    .then((response) => {
      if(response.status == 200){
        const blob1 = new Blob([response.data]);
        // Convert blob to URL
        const url = URL.createObjectURL(blob1);
        PrintJS({printable: url, type: 'pdf'});
    }
    
    })
    .catch((error)=>{
        console.log(error.message);
    })
  },
  downloadClientReceipt({commit,state}, formData){
    axios
    .post(`api/v1/client-receipt-pdf/`, formData, { responseType: 'blob' })
    .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Customer Receipt.pdf');
        document.body.appendChild(link);
        link.click();
    }
    
    })
    .catch((error)=>{
        console.log(error.message);
    })
  },
  downloadPaymentVoucher({commit,state}, formData){
    axios
    .post(`api/v1/client-receipt-pdf/`, formData, { responseType: 'blob' })
    .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Payment Voucher.pdf');
        document.body.appendChild(link);
        link.click();
    }
    
    })
    .catch((error)=>{
        console.log(error.message);
    })
  },
  previewTenantInvoice({commit,state}, formData){
    axios
    .post(`api/v1/tenant-invoice-pdf/`, formData, { responseType: 'blob' })
    .then((response) => {
      if(response.status == 200){
        const blob1 = new Blob([response.data]);
        // Convert blob to URL
        const url = URL.createObjectURL(blob1);
        PrintJS({printable: url, type: 'pdf'});
    }
    
    })
    .catch((error)=>{
        console.log(error.message);
    })
  },
  downloadTenantInvoice({commit,state}, formData){
    axios
    .post(`api/v1/tenant-invoice-pdf/`, formData, { responseType: 'blob' })
    .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Tenant Invoice.pdf');
        document.body.appendChild(link);
        link.click();
    }
    
    })
    .catch((error)=>{
        console.log(error.message);
    })
  },
  previewTenantReceipt({commit,state}, formData){
    axios
    .post(`api/v1/tenant-receipt-pdf/`, formData, { responseType: 'blob' })
    .then((response) => {
      if(response.status == 200){
        const blob1 = new Blob([response.data]);
        // Convert blob to URL
        const url = URL.createObjectURL(blob1);
        PrintJS({printable: url, type: 'pdf'});
    }
    
    })
    .catch((error)=>{
        console.log(error.message);
    })
  },
  downloadTenantReceipt({commit,state}, formData){
    axios
    .post(`api/v1/tenant-receipt-pdf/`, formData, { responseType: 'blob' })
    .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Tenant Receipt.pdf');
        document.body.appendChild(link);
        link.click();
    }
    
    })
    .catch((error)=>{
        console.log(error.message);
    })
  },
  removeReceiptItem({commit, state}, index){
    state.journalsClientList.splice(index, 1); 
    commit('LIST_JOURNALS_CLIENT', state.journalsClientList);
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
  
  
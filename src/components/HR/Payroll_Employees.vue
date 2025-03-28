<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :showAddButton="showAddButton"
            :searchFilters="searchFilters"
            @searchPage="searchEmployees"
            @resetFilters="resetFilters"
            :dropdownOptions="dropdownOptions"
            @handleDynamicOption="handleDynamicOption"
            @removeItem="removeItem"
            @removeSelectedItems="removeItem"
            @printList="printEmployeesList"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="employeesList"
            :actions="actions"
            :showTotals="showTotals"
            :idField="idField"
            @handleSelectionChange="handleSelectionChange"
            @handleActionClick="handleActionClick"
            :count="propCount"
            :currentPage="currentPage"
            :result="propArrLen"
            @loadPrev="loadPrev"
            @loadNext="loadNext"
            @firstPage="firstPage"
            @lastPage="lastPage"
            :showNextBtn="showNextBtn"
            :showPreviousBtn="showPreviousBtn"
            :selectedValue="selectedValue"
            @selectSearchQuantity="selectSearchQuantity"
        />
    </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, onBeforeMount} from 'vue';
import PageComponent from '@/components/PageComponent.vue'
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import PrintJS from 'print-js';
import MovableModal from '@/components/MovableModal.vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import Swal from 'sweetalert2';

export default{
    name: 'Payroll_Employees',
    components:{
        PageComponent,MovableModal,SearchableDropdown
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const trans_modal_loader = ref('none');
        const idField = 'payroll_employee_id';
        const showAddButton = ref(false);
        const rightsModule = ref('HR');
        const submitButtonLabel = ref('Add');
        const selectedIds = ref([]);
        const employeesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const transTitle = ref('Transfer Unit');
        const transModalVisible = ref(false);
        const dropdownWidth = ref("320px")
        const modal_top = ref('200px');
        const modal_left = ref('400px');
        const modal_width = ref('50vw');
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Staff No", key:"staff_number"},
            {label: "Employee Name", key:"employee_name"},
            {label: "Basic Pay", key:"base_salary", type: "number", textColor: "black"},
            {label: "Allowances", key: "allowances", type: "number", textColor: "black"},
            {label: "Gross Pay", key:"gross_pay", type: "number", textColor: "black"},
            {label: "S.H.I.F", key:"shif_amount", type: "number", textColor: "black"},
            {label: "N.S.S.F", key:"nssf_amount", type: "number", textColor: "black"},
            {label: "A.H.L", key:"housing_levy_amount", type: "number", textColor: "black"},
            {label: "Net P.A.Y.E", key:"tax", type: "number", textColor: "black"},
            {label: "Advances", key:"salary_advances", type: "number", textColor: "black"},
            {label: "Loans", key:"company_loans", type: "number", textColor: "black"},
            {label: "Other Ded.", key:"deductions", type: "number", textColor: "black"},
            {label: "Net Pay", key:"net_pay", type: "number", textColor: "black"},
        ])
        const showTotals = ref(true);
        const actions = ref([
            {name: 'email-payslip', icon: 'fa fa-envelope', title: 'Email Payslip', rightName: 'Sending HR Emails'},
            {name: 'print', icon: 'fa fa-print', title: 'Print Payslip', rightName: 'Print Payslip'},

        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const payrollID = computed(()=> store.state.Payrolls.payrollID);
        const staff_number_search = ref('');
        const employee_name_search = ref('');
        const searchFilters = ref([
            {type:'text', placeholder:"Staff No...", value: staff_number_search, width:64,},
            {type:'text', placeholder:"Employee Name...", value: employee_name_search, width:64,},
        ]);

        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
        const showTransModalLoader = () =>{
            trans_modal_loader.value = "block";
        }
        const hideTransModalLoader = () =>{
            trans_modal_loader.value = "none";
        }
        const emailPaySlip = async(employeeID) =>{

            let formData = {
                employee: employeeID,
                company: companyID.value
            }
            Swal.fire({
            title: "Are you sure?",
            text: `Do you wish to Email Payslip?`,
            type: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes Email Payslip!',
            cancelButtonText: 'Cancel!',
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom',
            },
            showLoaderOnConfirm: true,
            }).then((result) => {
            if (result.value) {
                axios.post(`api/v1/email-employee-payslip/`,formData)
                .then((response)=>{
                if(response.data.msg == "Success"){
                    Swal.fire("Email Sent succesfully!", {
                        icon: "success",
                    }); 
                    searchEmployees();
                }else if(response.data.msg == "Failed"){
                    Swal.fire({
                        title: "Error Sending Pyslip",
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
                Swal.fire(`Email has not been sent!`);
            }
            })     
        };
        const closeTransModal = () =>{
            transModalVisible.value = false;
            employeeID.value = null;
            hideTransModalLoader();
        };
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
       
        const searchEmployees = () =>{
            showLoader();
            showNextBtn.value = false;
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                staff_number: staff_number_search.value,
                employee_name: employee_name_search.value,
                payroll: payrollID.value,
                company: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/payroll-employees-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                employeesList.value = response.data.results;
                // store.commit('Terminated_Leases/LIST_TENANTS', employeesList.value)
                propResults.value = response.data;
                propArrLen.value = employeesList.value.length;
                propCount.value = propResults.value.count;
                pageCount.value = Math.ceil(propCount.value / selectedValue.value);
                if(response.data.next){
                    showNextBtn.value = true;
                }
                if(response.data.previous){
                    showPreviousBtn.value = true;
                }
            })
            .catch((error)=>{
                console.log(error.message);
            })
            .finally(()=>{
                hideLoader();
            })
        };
        const selectSearchQuantity = (newValue) =>{
            selectedValue.value = newValue;
            searchEmployees(selectedValue.value);
        };
        const resetFilters = () =>{
            currentPage.value = 1;
            selectedValue.value = 50;
            staff_number_search.value = "";
            employee_name_search.value = "";
            searchEmployees();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchEmployees();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchEmployees();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchEmployees();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchEmployees();
            // scrollToTop();
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if(action == 'email-payslip'){
                showLoader();
                const employeeID = [row['employee_id']];
                const payrollID = row['payroll_id'];
      
                let formData = {
                    employee: employeeID,
                    payroll: payrollID,
                    company: companyID.value
                }
                await axios.post('api/v1/employee-payslip-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Employee Payslip Template Not Set!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }else if(action == 'print'){
                const employeeID = row['employee_id'];
                showLoader();
                let formData = {
                    company: companyID.value,
                    employee: employeeID,
                    payroll: payrollID.value
                }
                axios
                .post("api/v1/print-employee-payslip-pdf/", formData, { responseType: 'blob' })
                    .then((response)=>{
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
                .finally(()=>{
                    hideLoader();
                })
                
            }
        };
        const dropdownOptions = ref([
            {label: 'Email Employee Payslips', action: 'email-payslip'},
        ]);
        const handleDynamicOption = async(option) =>{           
            if(option == 'email-payslip'){
                showLoader();
                const employeeID = selectedIds.value;
      
                let formData = {
                    employee: employeeID,
                    company: companyID.value
                }
                await axios.post('api/v1/employee-payslip-email/',formData).
                then((response)=>{
                    if(response.data.msg == "Success"){
                        toast.success("Email Sent!")
                    }else if(response.data.msg == "Missing Template"){
                        toast.error("Employee Payslip Template Not Set!")
                    }else{
                        toast.error(response.data.msg)
                    }
                })
                .catch((error)=>{
                    toast.error(error.message)
                })
                .finally(()=>{
                    hideLoader();
                })
            }
        };
        
        const printEmployeesList = () =>{
            showLoader();
            let formData = {
                staff_number: staff_number_search.value,
                employee_name: employee_name_search.value,
                payroll: payrollID.value,
                company: companyID.value
            } 

            axios
            .post("api/v1/export-payroll-employees-pdf/", formData, { responseType: 'blob' })
                .then((response)=>{
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
            .finally(()=>{
                hideLoader();
            })
        }
        onBeforeMount(()=>{
            searchEmployees();
            
        })
        return{
            searchEmployees,resetFilters, searchFilters, tableColumns, employeesList,dropdownWidth,showAddButton,
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,
            submitButtonLabel, showModal, showLoader, loader, hideLoader,showTotals,
            handleSelectionChange,rightsModule,printEmployeesList,selectSearchQuantity,selectedValue, dropdownOptions, handleDynamicOption,
            modal_left,modal_top,modal_width,trans_modal_loader,transModalVisible,transTitle,showTransModalLoader,hideTransModalLoader,closeTransModal,
        }
    }
};
</script>
<template>
    <div class="z-10">
        <PageComponent 
            :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader"
            :addButtonLabel="addButtonLabel"
            @handleAddNew="addNewTemplate"
            :searchFilters="searchFilters"
            @searchPage="searchTemplates"
            @resetFilters="resetFilters"
            @removeItem="removeTemplate"
            @removeSelectedItems="removeTemplates"
            @printList="printList"
            :addingRight="addingRight"
            :rightsModule="rightsModule"
            :columns="tableColumns"
            :rows="templatesList"
            :actions="actions"
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
import { ref, computed, onMounted, onBeforeMount, watch} from 'vue';
import PageComponent from '@/components/PageComponent.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Email_Templates',
    components:{
        PageComponent,
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'email_template_id';
        const addButtonLabel = ref('New Template');
        const addingRight = ref('Creating Email Template');
        const rightsModule = ref('Settings');
        const submitButtonLabel = ref('Add');
        const editorComponentKey = ref(0);
        const selectedIds = ref([]);
        const templatesList = ref([]);
        const propResults = ref([]);
        const propArrLen = ref(0);
        const propCount = ref(0);
        const pageCount = ref(0);
        const selectedValue = ref(50);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const propModalVisible = ref(false);
        const isEditing = computed(()=> store.state.Email_Templates.isEditing);
        const selectedTemplate = computed(()=> store.state.Email_Templates.selectedTemplate);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Template Name", key:"template_name"},
            {label: "Type", key:"template_type"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Template', rightName: 'Editing Email Template'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Template', rightName: 'Deleting Email Template'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Email_Templates.name_search,
            set: (value) => store.commit('Email_Templates/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const type_search = computed({
            get: () => store.state.Email_Templates.type_search,
            set: (value) => store.commit('Email_Templates/SET_SEARCH_FILTERS', {"type_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Template Name...", value: name_search, width:56,},
            {
                type:'dropdown', placeholder:"Template Type..", value: type_search, width:56,
                options: [{text:'Customized',value:'Customized'},{text:'Tenant Invoice',value:'Tenant Invoice'},{text:'Tenant Receipt',value:'Tenant Receipt'},{text:'Tenant Balance Reminder',value:'Tenant Balance Reminder'},{text:'Tenant Creation',value:'Tenant Creation'},{text:'Tenant Portal Invitation',value:'Tenant Portal Invitation'},{text:'Tenant Meter Reading',value:'Tenant Meter Reading'},
                            {text:'Tenant Statement',value:'Tenant Statement'},{text:'Customer Invoice',value:'Customer Invoice'},{text:'Customer Receipt',value:'Customer Receipt'},{text:'Member Receipt',value:'Member Receipt'},{text:'Customer Balance Reminder',value:'Customer Balance Reminder'},{text:'Member Creation',value:'Member Creation'},{text:'Member Portal Invitation',value:'Member Portal Invitation'},
                            {text:'Member Loan Balance',value:'Member Loan Balance'}
                ]
            },
        ]);
        const handleSelectionChange = (ids) => {
            selectedIds.value = ids;
        };
  
        const handleReset = () =>{
            
        }

        watch([selectedTemplate], () => {
            if (selectedTemplate.value) {
                editorComponentKey.value += 1;
            }
            
        }, { immediate: true });
        
        const removeTemplate = async() =>{
            if(selectedIds.value.length == 1){
                let formData = {
                    company: companyID.value,
                    email_template: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Email_Templates/deleteTemplate',formData)
                    if(response && response.status == 200){
                        toast.success("Template Removed Succesfully");
                        searchTemplates();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Template: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else if(selectedIds.value.length > 1){
                toast.error("You have selected more than 1 Template") 
            }else{
                toast.error("Please Select A Template To Remove")
            }
        }
        const removeTemplates = async() =>{
            if(selectedIds.value.length){
                let formData = {
                    company: companyID.value,
                    email_template: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Email_Templates/deleteTemplate',formData)
                    if(response && response.status == 200){
                        toast.success("Template(s) Removed Succesfully");
                        searchTemplates();
                    }
                }
                catch(error){
                    console.error(error.message);
                    toast.error('Failed to remove Templates: ' + error.message);
                }
                finally{
                    selectedIds.value = [];
                }
            }else{
                toast.error("Please Select A Template To Remove")
            }
        }
        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchTemplates = () =>{
            showLoader();
            showNextBtn.value = false;
            showPreviousBtn.value = false;
            let formData = {
                template_name: name_search.value,
                template_type: type_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/email-templates-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                templatesList.value = response.data.results;
                store.commit('Email_Templates/LIST_TEMPLATES', templatesList.value)
                propResults.value = response.data;
                propArrLen.value = templatesList.value.length;
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
            searchTemplates(selectedValue.value);
        };
        const resetFilters = () =>{
            store.commit('Email_Templates/RESET_SEARCH_FILTERS')
            searchTemplates();
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchTemplates();
            // scrollToTop();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchTemplates();
            // scrollToTop(); 
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchTemplates();
            // scrollToTop();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchTemplates();
            // scrollToTop();
        }
        const addNewTemplate = async() =>{
            await store.dispatch("Email_Templates/updateState",{selectedTemplate:null, isEditing:false})
            store.commit('pageTab/ADD_PAGE', {'SET':'Design_Email_Template'});
            store.state.pageTab.setActiveTab = 'Design_Email_Template';    
            
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const templateID = row['email_template_id'];
                let formData = {
                    company: companyID.value,
                    email_template: templateID
                }

                await store.dispatch('Email_Templates/fetchTemplate',formData)
                .then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'SET':'Design_Email_Template'});
                    store.state.pageTab.setActiveTab = 'Design_Email_Template'; 
                })

            }else if(action == 'delete'){
                const templateID = [row['email_template_id']];
                let formData = {
                    company: companyID.value,
                    email_template: templateID
                }
                await store.dispatch('Email_Templates/deleteTemplate',formData).
                then(()=>{
                    searchTemplates();
                })
            }else if(action == 'view'){
                console.log("VIEWING TAKING PLACE");
            }
        }
        const closeModal = () =>{
            propModalVisible.value = false;
        }
        onBeforeMount(()=>{
            searchTemplates();
            
        })
        return{
            searchTemplates,resetFilters, addButtonLabel, searchFilters, tableColumns, templatesList,
            propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,
            submitButtonLabel, addNewTemplate, showLoader, loader,handleSelectionChange,removeTemplate, removeTemplates,addingRight,rightsModule
        }
    }
};
</script>
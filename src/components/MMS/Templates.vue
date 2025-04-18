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
            :removingRight="removingRight"
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
    name: 'Templates',
    components:{
        PageComponent,
    },
    setup(){
        const store = useStore();     
        const toast = useToast();
        const loader = ref('none');
        const modal_loader = ref('none');
        const idField = 'membership_template_id';
        const addButtonLabel = ref('New Template');
        const addingRight = ref('Creating Template');
        const removingRight = ref('Deleting Template');
        const rightsModule = ref('MMS');
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
        const isEditing = computed(()=> store.state.Member_Templates.isEditing);
        const selectedTemplate = computed(()=> store.state.Member_Templates.selectedTemplate);
        const showModal = ref(false);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Template Name", key:"template_name"},
            {label: "Type", key:"template_type"},
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Template', rightName: 'Editing Template'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Template', rightName: 'Deleting Template'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const name_search = computed({
            get: () => store.state.Member_Templates.name_search,
            set: (value) => store.commit('Member_Templates/SET_SEARCH_FILTERS', {"name_search":value}),
        });
        const type_search = computed({
            get: () => store.state.Member_Templates.type_search,
            set: (value) => store.commit('Member_Templates/SET_SEARCH_FILTERS', {"type_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Template Name...", value: name_search, width:56,},
            {
                type:'dropdown', placeholder:"Template Type..", value: type_search, width:56,
                options: [{text:'Registration Form',value:'Registration Form'},{text:'Loan Security Claim',value:'Loan Security Claim'},{text:'Loan Application Form',value:'Loan Application Form'}]
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
                    property_template: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Member_Templates/deleteTemplate',formData)
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
                    property_template: selectedIds.value
                }
                try{
                    const response = await store.dispatch('Member_Templates/deleteTemplate',formData)
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
            selectedIds.value = [];
            showPreviousBtn.value = false;
            let formData = {
                template_name: name_search.value,
                template_type: type_search.value,
                company_id: companyID.value,
                page_size: selectedValue.value
            } 
            axios
            .post(`api/v1/membership-templates-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                templatesList.value = response.data.results;
                store.commit('Member_Templates/LIST_TEMPLATES', templatesList.value)
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
            store.commit('Member_Templates/RESET_SEARCH_FILTERS')
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
            await store.dispatch("Member_Templates/updateState",{selectedTemplate:null, isEditing:false})
            store.commit('pageTab/ADD_PAGE', {'MMS':'Design_Template'});
            store.state.pageTab.mmsActiveTab = 'Design_Template';    
            
        }
        const handleActionClick = async(rowIndex, action, row) =>{
            if( action == 'edit'){
                const templateID = row['membership_template_id'];
                let formData = {
                    company: companyID.value,
                    membership_template: templateID
                }

                await store.dispatch('Member_Templates/fetchTemplate',formData)
                .then(()=>{
                    store.commit('pageTab/ADD_PAGE', {'MMS':'Design_Template'});
                    store.state.pageTab.mmsActiveTab = 'Design_Template'; 
                })

            }else if(action == 'delete'){
                const templateID = [row['membership_template_id']];
                let formData = {
                    company: companyID.value,
                    membership_template: templateID
                }
                await store.dispatch('Member_Templates/deleteTemplate',formData).
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
            currentPage,propResults, propArrLen, propCount, pageCount, showNextBtn, showPreviousBtn,selectSearchQuantity,selectedValue,
            loadPrev, loadNext, firstPage, lastPage, idField, actions, handleActionClick,
            submitButtonLabel, addNewTemplate, showLoader, loader,handleSelectionChange,removeTemplate, removeTemplates,addingRight,removingRight,rightsModule
        }
    }
};
</script>
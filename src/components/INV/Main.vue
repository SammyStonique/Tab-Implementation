<template>
    <div class="bg-red-200 w-full min-h-[98vh] bottom-8">
        <TopBar @minimize="minimize" @close="close" />
        <NavBar :title="title"/>
        <PagesTab/>
    </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue'
import NavBar from '@/components/NavBar.vue'
import PagesTab from '@/components/INV/PagesTab.vue'
import { useStore } from 'vuex';
import { ref } from 'vue';
export default{
    components:{
        TopBar,
        NavBar,
        PagesTab
    },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    setup(){
        const store = useStore();
        const title = ref('Inventory Management')
        const minimize = () =>{
            store.commit('modulesTab/MINIMIZE_TAB')
        }
        const close = () =>{
            store.commit('modulesTab/REMOVE_TAB', 'Inventory Management')
        }
        return{
            close,
            minimize,
            title
        }
    }
}
</script>
<template>
    <div class="bg-red-200 w-full min-h-[98vh] bottom-8">
        <NavBar :title="title" @minimize="minimize" @close="close" />
        <PagesTab/>
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import PagesTab from '@/components/INV/PagesTab.vue';
import { useStore } from 'vuex';
import { ref } from 'vue';
export default{
    components:{
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
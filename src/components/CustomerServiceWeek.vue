<template>
  <Loader 
    :loader="loader"
    @showLoader="showLoader"
    @hideLoader="hideLoader"
  />
  <div class="customer-service-week">
    <div class="w-full h-screen bg-[url('@/assets/image2.jpg')] bg-cover bg-center grid place-items-center">
      <div class="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 h-auto bg-white p-6 rounded-lg shadow-lg text-center">
        
        <!-- Company Logo -->
        <div class="flex justify-center mb-6">
          <div 
            class="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-[url('@/assets/kalitech.png')] bg-cover bg-center">
          </div>
        </div>

        <!-- Greeting Text -->
        <h1 class="text-2xl sm:text-3xl font-bold text-green-600 mb-4">
          Happy Customer Service Week 🎉
        </h1>
        <p class="text-gray-700 text-lg mb-6">
          We appreciate your trust and support.  
          Thank you for being part of our journey!  
          💚 Your satisfaction is our priority.
        </p>

        <!-- Call-to-action -->
        <div class="mt-4">
          <button 
            @click="celebrate" 
            class="bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded-lg w-40">
            Celebrate With Us
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted } from "vue";
import { useToast } from "vue-toastification";
import Loader from "@/components/Loader.vue";
import confetti from "canvas-confetti";

export default defineComponent({
  name: "CustomerServiceWeek",
  components: { Loader },
  setup() {
    const toast = useToast();
    const loader = ref("none");

    const showLoader = () => { loader.value = "block"; };
    const hideLoader = () => { loader.value = "none"; };

    const fireConfetti = () => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } });
        confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } });
      }, 500);
    };

    const celebrate = () => {
      showLoader();
      setTimeout(() => {
        hideLoader();
        toast.success("🎊 Thank you for celebrating with us! We value you.");
        fireConfetti();
      }, 1500);
    };

    // Fire confetti when page loads
    onMounted(() => {
      setTimeout(() => {
        toast.info("🎉 Welcome! Let’s celebrate Customer Service Week together!");
        fireConfetti();
      }, 1000);
    });

    return { loader, showLoader, hideLoader, celebrate };
  },
});
</script>

<style scoped>
/* Optional custom styling */
</style>

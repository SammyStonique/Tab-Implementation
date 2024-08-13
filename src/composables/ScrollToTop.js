
export function useScrollToTop(){
    const scrollToTop = () =>{
        window.scrollTo({ top: 0, behavior: "smooth" });
        console.log("SCROLL IS FUNCTIONAL")
    }
    return{
        scrollToTop
    }
}

import { watchDebounced } from "@vueuse/core"

export const useCartStore = defineStore('CartStore', () => {
  const items = ref<any[]>([])
  const supabase = useSupabaseAuth()

  const totalCount = computed(() =>
    items.value.reduce((total, item) => total + item.amount, 0)
  )

  const subTotal = computed(() =>
    items.value.reduce((total, item) => total + item.item.fields.price * item.amount, 0)
  )

  const taxTotal = computed(() => subTotal.value * 0.1)
  const total = computed(() => subTotal.value + taxTotal.value)

  function addToCart(item: any) {
    const existingItem = items.value.find((i) => i.item.sys.id === item.sys.id)
    if (existingItem) {
      existingItem.amount++
    } else {
      items.value.push({ item, amount: 1 })
    }
  }

  function removeFromCart(itemId: string) {
    const index = items.value.findIndex((i) => i.item.sys.id === itemId)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  function replaceCart(newItems: any[]) {
    items.value = newItems || []
  }

  watchDebounced(
    items, async () => {
      if (!supabase.authReady) return

      await supabase.user.updateCart(items.value)
    },
    { 
      deep: true, 
      debounce: 500 
    },
  );

  return {
    items,
    totalCount,
    subTotal,
    taxTotal,
    total,
    addToCart,
    removeFromCart,
    replaceCart,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}

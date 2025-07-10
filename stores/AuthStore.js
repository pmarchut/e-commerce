import { defineStore, acceptHMRUpdate } from "pinia";

export const useSupabaseAuth = defineStore('supabaseAuth', () => {
  const supabase = useSupabaseClient()
  const cartStore = useCartStore()
  const router = useRouter()

  const loggedInUser = ref(null)
  const onAuthStateChangeCallbacks = ref([])
  const authReady = ref(false)
  const isProcessingSignUp = ref(false)

  async function initAuthWatcher() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        initUser(session?.user)
      }
    })
  }

  async function initUser(supabaseUser) {
    if (!supabaseUser) {
      loggedInUser.value = null
    } else {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') router.push('/logout')
        throw error
      }

      loggedInUser.value = {
        ...supabaseUser,
        ...profile,
      }

      const isSuccessPage = router.currentRoute.value.fullPath.includes('/checkout/success')

      if (profile.cart_id) {
        if (isSuccessPage && !authReady.value) {
          // ✅ Pusty koszyk, jesteśmy po zakupie → wyczyść też w Supabase
          try {
            await user.updateCart([])
          } catch (err) {
            console.error('Nie udało się wyczyścić koszyka w Supabase:', err)
          }
        } else {
          // 🛑 Normalny przypadek: pobierz koszyk z Supabase
          try {
            const cartItems = await user.getCart()
            await cartStore.replaceCart(cartItems)
          } catch (err) {
            console.error('Nie udało się załadować koszyka:', err)
          }
        }
      }
    }

    setTimeout(() => {
      authReady.value = true
    }, 750)
  }

  const auth = {
    onAuthStateChange(callback) {
      onAuthStateChangeCallbacks.value.push(callback)
    },
    async signUp({ email, password }) {
      isProcessingSignUp.value = true // 🔒 zablokuj initUser z onAuthStateChange

      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      const user = data.user
      if (!user) return

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({ user_id: user.id })

      if (profileError) throw profileError

      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .insert({ products: '[]' })
        .select()
        .single()

      if (cartError) throw cartError

      const cartId = cart.id

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ cart_id: cartId })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      await initUser(user)
      isProcessingSignUp.value = false // 🔓 odblokuj
    },
    async login({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      initUser(data.user)
    },
    async logout() {
      await supabase.auth.signOut()
      loggedInUser.value = null
    },
  }

  const user = {
    get() {
      return loggedInUser.value
    },
    logout: auth.logout,
    async updateCart(products) {
      const user = loggedInUser.value
      const cartId = Number(user?.cart_id)
      if (!cartId) return

      const { data, error } = await supabase
        .from('carts')
        .update({ products: JSON.stringify(products) })
        .eq('id', cartId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    async getCart() {
      const user = loggedInUser.value
      const cartId = Number(user?.cart_id)
      if (!cartId) return []

      const { data, error } = await supabase
        .from('carts')
        .select()
        .eq('id', cartId)
        .single()

      if (error) throw error
      return JSON.parse(data.products)
    },
  }

  const reviews = {
    async get(productId) {
      const { data, error } = await supabase
        .from('reviews')
        .select()
        .eq('product_id', productId)

      if (error) throw error
      return data
    },
    async submit({ text, rating, title, product_id }) {
      const { error } = await supabase
        .from('reviews')
        .insert([{ text, rating, title, product_id }])

      if (error) throw error
    },
  }

  return {
    supabase,
    loggedInUser,
    authReady,
    initAuthWatcher,
    auth,
    user,
    reviews,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSupabaseAuth, import.meta.hot));
}

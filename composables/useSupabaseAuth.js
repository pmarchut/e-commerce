export function useSupabaseAuth() {
  const supabase = useSupabaseClient() // ✅ już w środku setupu
  const router = useRouter()

  const loggedInUser = ref(null)
  const onAuthStateChangeCallbacks = ref([])

  function initAuthWatcher() {
    // Init user on app start
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) initUser(user)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null
      initUser(user)
      onAuthStateChangeCallbacks.value.forEach(cb => cb(user))
    })
  }

  const auth = {
    onAuthStateChange(callback) {
      onAuthStateChangeCallbacks.value.push(callback)
    },
    async signUp({ email, password }) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      const user = data.user
      if (!user) return

      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .insert({ products: [] })
        .select()
        .single()

      if (cartError) throw cartError

      const { error: updateError } = await supabase
        .from('users')
        .update({ cart_id: cart.id })
        .eq('id', user.id)

      if (updateError) throw updateError

      user['cart'] = cart
      initUser(user)
    },
    async login({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) await initUser(data.user)
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
      if (!user?.cart?.id) return

      const { data, error } = await supabase
        .from('carts')
        .update({ products })
        .eq('id', user.cart.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    async getCart() {
      const user = loggedInUser.value
      if (!user?.cart?.id) return []

      const { data, error } = await supabase
        .from('carts')
        .select()
        .eq('id', user.cart.id)
        .single()

      if (error) throw error
      return data.products
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
      const { error } = await supabase.from('reviews').insert([
        { text, rating, title, product_id },
      ])
      if (error) throw error
    },
  }

  async function initUser(user) {
    if (!user) {
      loggedInUser.value = null
      return
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('*, cart:carts(*)')
      .eq('id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') router.push('/logout')
      throw error
    }

    loggedInUser.value = userData
  }

  // ✅ Wystawiamy metodę do zainicjalizowania auth listenera
  return {
    auth,
    user,
    reviews,
    supabase,
    loggedInUser,
    initAuthWatcher, // trzeba wywołać to raz na starcie appki
  }
}

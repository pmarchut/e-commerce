<script setup>
const { siteName } = useConfig();
const supabase = useSupabaseAuth();
const loggedInUser = computed(() => supabase.loggedInUser);
const authReady = computed(() => supabase.authReady);

const cartStore = useCartStore();
</script>
<template>
  <div class="navbar bg-base-100 shadow-md">
    <div class="flex-1">
      <NuxtLink class="btn btn-ghost normal-case text-xl" to="/">{{
        siteName
      }}</NuxtLink>
    </div>
    <!-- Right Side -->
    <ClientOnly>
      <template #default> 
        <div class="flex-none">
          <div class="dropdown dropdown-end">
            <CartIcon :loading="false" :count="cartStore.totalCount" />
            <div
              tabindex="0"
              class="mt-3 card card-compact dropdown-content w-52 bg-base-100 shadow"
            >
              <div class="card-body">
                <span class="font-bold text-lg">{{ cartStore.totalCount }} Items</span>
                <span class="text-info">Subtotal: <ProductPrice :price="cartStore.subTotal" /></span>
                <div class="card-actions">
                  <NuxtLink :to="{ name: 'cart' }">
                    <button class="btn btn-primary btn-block">View cart</button>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="authReady">
            <!--Buttons for UN-logged In Users-->
            <div v-if="!loggedInUser">
              <NuxtLink
                to="/login"
                class="btn btn-ghost border-2 border-gray-100 btn-sm ml-5"
                >Login</NuxtLink
              >
              <NuxtLink to="/register" class="btn btn-primary btn-sm ml-2"
                >Register</NuxtLink
              >
            </div>

            <!--UI for logged In Users-->
            <div v-else class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-sm ml-5">
                <button>{{ loggedInUser.email }}</button>
              </label>
              <ul
                tabindex="0"
                class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a class="justify-between">
                    Profile
                    <span class="badge">New</span>
                  </a>
                </li>
                <li><a>Settings</a></li>
                <li><NuxtLink to="/logout">Logout</NuxtLink></li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, vi } from 'vitest'
import TheNavbar from '@/components/TheNavbar.vue'
import { useCartStore } from '@/stores/CartStore'
import { useSupabaseAuth } from '@/stores/AuthStore'

// Stały mock siteName
vi.mock('@/composables/AppConfig', () => ({
  useConfig: () => ({ siteName: 'My Shop' }),
}))

const factoryMount = async () => {
    return mountSuspended(TheNavbar, {
      global: {
      stubs: {
        NuxtLink: {
          template: '<a :href="to"><slot /></a>',
          props: ['to'],
        },
      },
    },
  })
}

describe('TheNavbar.vue', () => {
  it('renders the site name and homepage link', async () => {
    const wrapper = await factoryMount()

    const homeLink = wrapper.find('a[href="/"]')
    expect(homeLink.exists()).toBe(true)
    expect(homeLink.text()).toContain('My Shop')
  })

  it('shows login and register buttons when not logged in', async () => {
    const auth = useSupabaseAuth()
    auth.authReady = true
    auth.loggedInUser = null // Ustawienie braku zalogowanego użytkownika

    const wrapper = await factoryMount()
    expect(wrapper.text()).toContain('Login')
    expect(wrapper.text()).toContain('Register')
  })

  it('shows user email and profile menu when logged in', async () => {
    const auth = useSupabaseAuth()
    auth.authReady = true
    auth.loggedInUser = {
      email: 'user@example.com',
    } as any

    const wrapper = await factoryMount()
    expect(wrapper.text()).toContain('user@example.com')
    expect(wrapper.text()).toContain('Profile')
    expect(wrapper.text()).toContain('Logout')
  })

  it('always renders the cart icon and "View cart" link', async () => {
    const wrapper = await factoryMount()
    expect(wrapper.text()).toContain('0 Items')
    expect(wrapper.text()).toContain('View cart')
  })

  it('displays correct number of items in cart', async () => {
    const cart = useCartStore()
    cart.items = [
      { item: { fields: { price: 699 } }, amount: 1 }, 
      { item: { fields: { price: 1199 } }, amount: 2 }
    ]
    const wrapper = await factoryMount()

    expect(wrapper.find('.badge').text()).toBe('3')

    const dropdownContent = wrapper.find('.dropdown-content')

    expect(dropdownContent.text()).toContain('3 Items')
    expect(dropdownContent.text()).toContain('Subtotal: $30.97')
  })
})

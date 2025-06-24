import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TheNavbar from '@/components/TheNavbar.vue'
import { useCartStore } from '@/stores/CartStore'

// Stały mock siteName
vi.mock('@/composables/AppConfig', () => ({
  useConfig: () => ({ siteName: 'My Shop' }),
}))

// Domyślny mock Supabase z możliwością nadpisywania
let loggedInUserMock: { value: null | { email: string } } = { value: null }

vi.mock('@/composables/useSupabaseAuth', () => ({
  useSupabaseAuth: () => ({
    loggedInUser: loggedInUserMock,
  }),
}))

const factoryMount = () => {
    return mount(TheNavbar, {
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
  beforeEach(() => {
    // Reset stanu przed każdym testem
    loggedInUserMock = { value: null }
  })

  it('renders the site name and homepage link', () => {
    const wrapper = factoryMount()

    const homeLink = wrapper.find('a[href="/"]')
    expect(homeLink.exists()).toBe(true)
    expect(homeLink.text()).toContain('My Shop')
  })

  it('shows login and register buttons when not logged in', () => {
    const wrapper = factoryMount()
    expect(wrapper.text()).toContain('Login')
    expect(wrapper.text()).toContain('Register')
  })

  it('shows user email and profile menu when logged in', () => {
    loggedInUserMock = {
      value: {
        email: 'user@example.com',
      },
    }

    const wrapper = factoryMount()
    expect(wrapper.text()).toContain('user@example.com')
    expect(wrapper.text()).toContain('Profile')
    expect(wrapper.text()).toContain('Logout')
  })

  it('always renders the cart icon and "View cart" link', () => {
    const wrapper = factoryMount()
    expect(wrapper.text()).toContain('0 Items')
    expect(wrapper.text()).toContain('View cart')
  })

  it('displays correct number of items in cart', () => {
    const cart = useCartStore()
    cart.items = [
      { item: { fields: { price: 699 } }, amount: 1 }, 
      { item: { fields: { price: 1199 } }, amount: 2 }
    ]
    const wrapper = factoryMount()

    expect(wrapper.find('.badge').text()).toBe('3')

    const dropdownContent = wrapper.find('.dropdown-content')

    expect(dropdownContent.text()).toContain('3 Items')
    expect(dropdownContent.text()).toContain('Subtotal: $30.97')
  })
})

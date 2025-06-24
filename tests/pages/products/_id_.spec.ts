import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ProductPage from '~/pages/products/[id].vue'
import { useProductStore } from '~/stores/ProductStore'
import { useAlertsStore } from '~/stores/AlertsStore'
import { useCartStore } from '~/stores/CartStore'

const defaultProductStub = {
  sys: { id: '123' },
  fields: {
    name: 'Test Product',
    summary: 'Short summary',
    description: 'Full **markdown** description',
    price: 19.99,
    heatLevel: 1,
    image: [
      {
        fields: {
          file: {
            url: 'http://example.com/image.jpg',
            description: 'Example image',
          },
        },
      },
    ],
  },
}

async function factoryMount(overrides: { product?: any, alertSuccess?: Mock, addToCart?: Mock } = {}) {
  const product = overrides.product || defaultProductStub
  const alertSuccess = overrides.alertSuccess || vi.fn()
  const addToCart = overrides.addToCart || vi.fn()

  const productStore = useProductStore()
  productStore.fetchProduct = vi.fn().mockImplementation(async () => {
    productStore.singleProduct = product
  })

  const alertsStore = useAlertsStore()
  alertsStore.success = alertSuccess

  const cartStore = useCartStore()
  cartStore.addToCart = addToCart

  const wrapper = await mountSuspended(ProductPage, {
    global: {
      stubs: {
        NuxtLink: {
          props: ['to'],
          template: '<a :href="to"><slot /></a>',
        },
        ProductPrice: true,
        ProductHeat: true,
        ProductReviews: true,
      },
      mocks: {
        $route: { params: { id: product.sys.id } },
      },
    },
  })

  return { wrapper, productStore, alertsStore, alertSuccess }
}

describe('ProductPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders product details from API', async () => {
    const { wrapper } = await factoryMount()

    expect(wrapper.text()).toContain('Test Product')
    expect(wrapper.text()).toContain('Short summary')
    expect(wrapper.html()).toContain('<p>Full <strong>markdown</strong> description</p>')
  })

  it('shows alert when adding to cart', async () => {
    const customProduct = {
      ...defaultProductStub,
      fields: {
        ...defaultProductStub.fields,
        name: 'Alert Test Product',
      },
    }

    const alertSuccess = vi.fn()
    const addToCart = vi.fn()
    const { wrapper } = await factoryMount({
      product: customProduct,
      alertSuccess,
      addToCart
    })

    await wrapper.find('button.btn-primary').trigger('click')

    expect(alertSuccess).toHaveBeenCalledWith('Alert Test Product added to cart')
    expect(addToCart).toHaveBeenCalledWith(customProduct)
  })
})

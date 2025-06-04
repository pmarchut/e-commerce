import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'
import { useProductStore } from '~/stores/ProductStore'

vi.mock('~/components/HomeHero.vue', () => ({ default: { template: '<div>Hero</div>' }}))
vi.mock('~/components/ProductFilters.vue', () => ({ default: { template: '<div>Filters</div>' }}))
vi.mock('~/components/ProductCard.vue', () => ({ default: { props: ['product'], template: '<div>{{ product.fields.name }}</div>' }}))

describe('IndexPage.vue', () => {
  it('loads and displays products', async () => {
    const store = useProductStore()
    store.fetchProducts = vi.fn().mockImplementation(async () => {
      store.products = [
        {
          sys: { id: '1' },
          fields: { name: 'Produkt 1' },
        },
        {
          sys: { id: '2' },
          fields: { name: 'Produkt 2' },
        },
      ] as any
    })

    const wrapper = await mountSuspended(IndexPage)

    expect(store.fetchProducts).toHaveBeenCalled()
    expect(wrapper.html()).toContain('Produkt 1')
    expect(wrapper.html()).toContain('Produkt 2')
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useProductStore } from '@/stores/ProductStore'
import ProductFilters from '@/components/ProductFilters.vue'

const router = { push: vi.fn() }
const mockRoute = { query: {} }

mockNuxtImport('useRouter', () => {
  return () => {
    return router
  }
})

mockNuxtImport('useRoute', () => {
  return () => {
    return mockRoute
  }
})

describe('ProductFilters', () => {
  let store: ReturnType<typeof useProductStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductStore()
    vi.useFakeTimers()
  })

  it('updates query filter when typing in input', async () => {
    const wrapper = mount(ProductFilters)
    const input = wrapper.find('input#search')

    await input.setValue('chili')
    expect(store.filters.query).toBe('chili')
  })

  it('updates heat level when selected', async () => {
    const wrapper = mount(ProductFilters)
    const select = wrapper.find('select#filterHeat')

    await select.setValue('Hot')
    expect(store.filters['fields.heatLevel']).toBe('Hot')
  })

  it('updates order filter when selected', async () => {
    const wrapper = mount(ProductFilters)
    const select = wrapper.find('select#orderBy')

    await select.setValue('-fields.price')
    expect(store.filters.order).toBe('-fields.price')
  })

  it('calls fetchProducts when search input changes', async () => {
    const spy = vi.spyOn(store, 'fetchProducts').mockResolvedValue([])

    const wrapper = mount(ProductFilters)

    const input = wrapper.find('input#search')
    await input.setValue('jalapeno')

    // Upływ czasu debounce
    vi.advanceTimersByTime(500)

    expect(spy).toHaveBeenCalled()
  })

  it('filters change updates query and calls fetchProducts after 500ms', async () => {
    const fetchProductsSpy = vi.spyOn(store, 'fetchProducts').mockResolvedValue([])
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(ProductFilters)

    // Zmieniamy filtr wyszukiwania
    const input = wrapper.find('input#search')
    await input.setValue('jalapeno')

    // Przed debounce — router i fetch nie wywołane
    expect(pushSpy).not.toHaveBeenCalled()
    expect(fetchProductsSpy).not.toHaveBeenCalled()

    // Upływ czasu debounce
    vi.advanceTimersByTime(500)

    expect(fetchProductsSpy).toHaveBeenCalledTimes(1)
    expect(pushSpy).toHaveBeenCalledTimes(1)

    // Sprawdzamy argumenty przekazane do router.push
    const queryCalled = pushSpy.mock.calls[0][0].query
    expect(queryCalled).toMatchObject({ query: 'jalapeno' })
  })
})

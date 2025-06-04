import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useProductStore } from '@/stores/ProductStore'
import ProductFilters from '@/components/ProductFilters.vue'

describe('ProductFilters', () => {
  let store: ReturnType<typeof useProductStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductStore()
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
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'
import { useProductStore } from '~/stores/ProductStore'

vi.mock('~/components/HomeHero.vue', () => ({ default: { template: '<div>Hero</div>' }}))
vi.mock('~/components/ProductCard.vue', () => ({ default: { props: ['product'], template: '<div>{{ product.fields.name }}</div>' }}))

function deferredPromise<T = void>() {
  let resolve: (value: T | PromiseLike<T>) => void
  let reject: (reason?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve: resolve!, reject: reject! }
}

describe('IndexPage.vue', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

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

  it('shows spinner if loading takes more than 500ms', async () => {
    vi.useFakeTimers()

    const store = useProductStore()

    // Na start: szybki fetch, żeby nie zawiesić mountSuspended
    store.fetchProducts = vi.fn().mockImplementation(() => Promise.resolve())

    const wrapper = await mountSuspended(IndexPage)

    const fetchDeferred = deferredPromise<void>()
    store.fetchProducts = vi.fn().mockImplementation(() => {
      store.loading = true
      return fetchDeferred.promise.then((data: any) => {
        store.products = data
        store.loading = false
        return data
      })
    })

    // Zmień filtr, co wywoła fetch
    const select = wrapper.find('select#orderBy')
    await select.setValue('fields.price')

    expect(wrapper.find('[role="status"]').exists()).toBe(false)

    // Odpal debounce 500ms
    await vi.advanceTimersByTimeAsync(500)
    await nextTick()

    // Spinner powinien się pojawić
    expect(wrapper.find('[role="status"]').exists()).toBe(true)

    fetchDeferred.resolve([{ sys: { id: '2' }, fields: { name: 'Slow Product' } }] as any)
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()

    // Spinner powinien zniknąć
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.html()).toContain('Slow Product')

    vi.useRealTimers()
  })
})

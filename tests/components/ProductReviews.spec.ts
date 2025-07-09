import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProductReviews from '@/components/ProductReviews.vue'

// helpers
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

// Review mock resolver (można nadpisywać w testach)
let mockGetReviews: () => Promise<any[]> = async () => {
  await new Promise(resolve => setTimeout(resolve, 50)) // sztuczne opóźnienie
  return []
}
let mockSubmit = vi.fn()

// Mocks
vi.mock('@/stores/AuthStore', () => ({
  useSupabaseAuth: () => ({
    reviews: {
      get: () => mockGetReviews(),
      submit: (...args: any[]) => mockSubmit(...args),
    },
  }),
}))

vi.mock('@/stores/AlertsStore', () => ({
  useAlertsStore: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}))

describe('ProductReviewSection.vue', () => {
  beforeEach(() => {
    // domyślne dane: pusty array po krótkim czasie
    mockGetReviews = async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
      return []
    }
  })

  it('renders loading message when loading', async () => {
    // skracamy delay dla testu
    mockGetReviews = async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return []
    }

    const wrapper = await mountSuspended(ProductReviews, {
      props: {
        productId: '123',
      },
    })

    expect(wrapper.text()).toContain('Loading...')
  })

  it('renders average rating and distribution', async () => {
    mockGetReviews = async () => [
      { rating: 5, title: 'Great', text: 'Loved it', product_id: '123' },
      { rating: 4, title: 'Good', text: 'Pretty good', product_id: '123' },
      { rating: 5, title: 'Awesome', text: 'Excellent', product_id: '123' }
    ]

    const wrapper = await mountSuspended(ProductReviews, {
      props: {
        productId: '123',
      },
    })

    // Średnia ocena (5 + 4 + 5) / 3 = 4.67
    expect(wrapper.text()).toMatch(/4\.6|4\.7/)

    // Rozkład ocen
    expect(wrapper.text()).toContain('(2 Reviews)')
    expect(wrapper.text()).toContain('(1 Reviews)')
  })

  it('toggles review form visibility', async () => {
    mockGetReviews = async () => []

    const wrapper = await mountSuspended(ProductReviews, {
      props: { productId: '123' },
    })

    // Początkowo formularz nie powinien być widoczny
    expect(wrapper.text()).not.toContain('Post Review')

    // Kliknij przycisk, by pokazać formularz
    const toggleBtn = wrapper.findAll('button').find(btn => btn.text() === 'Write a Review')
    await toggleBtn?.trigger('click')

    expect(wrapper.text()).toContain('Post Review')

    // Kliknij ponownie, by schować formularz
    await toggleBtn?.trigger('click')

    expect(wrapper.text()).not.toContain('Post Review')
  })

  it('toggles review list visibility', async () => {
    mockGetReviews = async () => [
      { rating: 5, title: 'Great', text: 'Loved it', product_id: '123' },
      { rating: 4, title: 'Okay', text: 'Pretty good', product_id: '123' }
    ]

    const wrapper = await mountSuspended(ProductReviews, {
      props: { productId: '123' },
    })

    expect(wrapper.text()).toContain('Great')
    expect(wrapper.text()).toContain('Okay')

    // Kliknij "Show Reviews"
    const toggleBtn = wrapper.findAll('button').find(btn => btn.text().includes('Hide All Reviews'))
    expect(toggleBtn).toBeTruthy()

    await toggleBtn!.trigger('click')
    await flush()

    // Powinny być widoczne recenzje
    expect(wrapper.text()).not.toContain('Great')
    expect(wrapper.text()).not.toContain('Okay')

    // Kliknij "Hide Reviews"
    await toggleBtn!.trigger('click')
    await flush()

    expect(wrapper.text()).toContain('Great')
    expect(wrapper.text()).toContain('Okay')
  })

  it('getRatingCount and getRatingPercentage work as they should', async () => {
    mockGetReviews = async () => [
      { rating: 5, title: 'A', text: 'A', product_id: '123' },
      { rating: 5, title: 'B', text: 'B', product_id: '123' },
      { rating: 4, title: 'C', text: 'C', product_id: '123' },
      { rating: 3, title: 'D', text: 'D', product_id: '123' },
      { rating: 3, title: 'E', text: 'E', product_id: '123' },
      { rating: 3, title: 'F', text: 'F', product_id: '123' },
    ]

    const wrapper = await mountSuspended(ProductReviews, {
      props: { productId: '123' },
    })

    // Weryfikujemy liczbę recenzji dla każdej oceny
    expect(wrapper.text()).toContain('(2 Reviews)') // 5 gwiazdek
    expect(wrapper.text()).toContain('(1 Reviews)') // 4 gwiazdki
    expect(wrapper.text()).toContain('(3 Reviews)') // 3 gwiazdki
    expect(wrapper.text()).toContain('(0 Reviews)') // 1 i 2 gwiazdki

    // Weryfikujemy wartości progress barów (procentowe)
    const progresses = wrapper.findAll('progress')

    // Kolejność gwiazdek: 1 → 5
    // Dane: [1:0, 2:0, 3:3, 4:1, 5:2] → razem 6 recenzji
    // Procenty: [0%, 0%, 50%, 16.66%, 33.33%]

    expect(progresses[0].attributes('value')).toBe('0')   // 1 star
    expect(progresses[1].attributes('value')).toBe('0')   // 2 stars
    expect(progresses[2].attributes('value')).toBe('50')  // 3 stars
    expect(progresses[3].attributes('value')).toBe('16.666666666666664')  // 4 stars
    expect(progresses[4].attributes('value')).toBe('33.33333333333333')   // 5 stars
  })
})

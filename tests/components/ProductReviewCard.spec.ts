import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductReviewCard from '@/components/ProductReviewCard.vue'

describe('ProductReviewCard', () => {
  it('renders review content correctly', () => {
    const mockReview = {
      title: 'Great product',
      text: 'Really enjoyed it!',
      rating: 4,
      created_at: new Date().toISOString(),
    }

    const wrapper = mount(ProductReviewCard, {
      props: { review: mockReview },
    })

    expect(wrapper.text()).toContain('Great product')
    expect(wrapper.text()).toContain('Really enjoyed it!')
    expect(wrapper.text()).toContain('⭐'.repeat(4)) // sprawdzenie gwiazdek
  })
})

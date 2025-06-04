import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductPrice from '@/components/ProductPrice.vue'

describe('ProductPrice', () => {
  it('renders formatted price correctly for valid input', () => {
    const wrapper = mount(ProductPrice, {
      props: { price: 1999 }, // $19.99
    })
    expect(wrapper.text()).toBe('$19.99')
  })

  it('renders $0.00 when price is 0', () => {
    const wrapper = mount(ProductPrice, {
      props: { price: 0 },
    })
    expect(wrapper.text()).toBe('$0.00')
  })
})

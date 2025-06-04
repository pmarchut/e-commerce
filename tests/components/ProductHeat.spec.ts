import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductHeat from '@/components/ProductHeat.vue'

describe('ProductHeat', () => {
  it.each([
    ['Mild', '🔥'],
    ['Medium', '🔥🔥'],
    ['Hot', '🔥🔥🔥'],
  ])('renders correct heat emoji for heatLevel=%s', (level, expected) => {
    const wrapper = mount(ProductHeat, {
      props: { heatLevel: level },
    })
    expect(wrapper.text()).toBe(expected)
  })

  it('renders empty string for undefined heatLevel', () => {
    const wrapper = mount(ProductHeat)
    expect(wrapper.text()).toBe('')
  })

  it('renders empty string for unsupported heatLevel', () => {
    const wrapper = mount(ProductHeat, {
      props: { heatLevel: 'ExtraHot' },
    })
    expect(wrapper.text()).toBe('')
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from '@/components/ProductCard.vue'

const mockProduct = {
  sys: { id: '123' },
  fields: {
    name: 'Super Hot Sauce',
    price: 999,
    heatLevel: 'Hot',
    summary: 'Extremely spicy!',
    image: [
      {
        fields: {
          file: {
            url: '/img.jpg',
            description: 'A spicy sauce',
          },
        },
      },
    ],
  },
}

describe('ProductCard', () => {
  it('renders product data correctly', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
          },
          ProductHeat: true,
          ProductPrice: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Super Hot Sauce')
    expect(wrapper.text()).toContain('View Item')
    expect(wrapper.text()).toContain('Extremely spicy!')

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('/img.jpg')
    expect(img.attributes('alt')).toBe('A spicy sauce')
  })

  it('links to correct product route', () => {
    const wrapper = mount(ProductCard, {
        props: { product: mockProduct },
        global: {
        stubs: {
            NuxtLink: true, // pełny stub z dostępem do props
            ProductHeat: true,
            ProductPrice: true,
        },
        },
    })

    const link = wrapper.findComponent({ name: 'NuxtLink' })

    expect(link.exists()).toBe(true)
    expect(link.props('to')).toEqual({
        name: 'products-id',
        params: { id: '123' },
    })
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CartIcon from '@/components/CartIcon.vue'
import AppSpinner from '@/components/AppSpinner.vue'

const factoryMount = (props?: { count: number, loading: boolean }) => {
    return mount(CartIcon, {
        props,
        global: {
            components: {
                AppSpinner,
            },
        },
    })
}

describe('CartIcon', () => {
  it('renders badge with count when not loading', () => {
    const wrapper = factoryMount({
        count: 3,
        loading: false,
    })

    const badge = wrapper.get('.badge')
    expect(badge.text()).toBe('3')
    expect(wrapper.findComponent({ name: 'AppSpinner' }).isVisible()).toBe(false)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders AppSpinner instead of badge when loading', () => {
    const wrapper = factoryMount({
        count: 5,
        loading: true,
    })

    expect(wrapper.find('.badge').isVisible()).toBe(false)

    const spinner = wrapper.findComponent({ name: 'AppSpinner' })
    expect(spinner.isVisible()).toBe(true)
    expect(spinner.props()).toMatchObject({
      color: 'gray',
      size: 'sm',
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders badge with 0 by default', () => {
    const wrapper = factoryMount()

    const badge = wrapper.get('.badge')
    expect(badge.text()).toBe('0')
    expect(wrapper.findComponent({ name: 'AppSpinner' }).isVisible()).toBe(false)

    expect(wrapper.html()).toMatchSnapshot()
  })
})

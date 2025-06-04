import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '@/components/AppButton.vue'
import AppSpinner from '@/components/AppSpinner.vue'

const factoryMount = (loading: boolean = false) => {
    return mount(AppButton, {
        props: {
            loading,
        },
        global: {
            components: {
                AppSpinner,
            },
        },
        slots: {
            default: 'Click me',
        },
    })
}

describe('AppButton', () => {
  it('renders button with slot content', () => {
    const wrapper = factoryMount()
    expect(wrapper.text()).toContain('Click me')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('shows spinner when loading is true', () => {
    const wrapper = factoryMount(true)
    expect(wrapper.findComponent({ name: 'AppSpinner' }).exists()).toBe(true)
  })

  it('does not show spinner when loading is false', () => {
    const wrapper = factoryMount()
    expect(wrapper.findComponent({ name: 'AppSpinner' }).exists()).toBe(false)
  })
})

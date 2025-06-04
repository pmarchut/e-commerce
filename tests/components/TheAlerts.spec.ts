import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAlertsStore } from '@/stores/AlertsStore'
import TheAlerts from '@/components/TheAlerts.vue'

describe('TheAlerts.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders alert message from store', () => {
    const store = useAlertsStore()
    store.notify('Hello World', 'success', { timeout: false })

    const wrapper = mount(TheAlerts)
    expect(wrapper.text()).toContain('Hello World')
  })

  it('removes alert when "x" is clicked', async () => {
    const store = useAlertsStore()
    store.notify('To be removed', 'warning', { timeout: false })

    const wrapper = mount(TheAlerts)
    expect(wrapper.text()).toContain('To be removed')

    await wrapper.find('button').trigger('click')
    expect(store.items.length).toBe(0)
  })

  it('auto-removes alert after timeout', async () => {
    vi.useFakeTimers()
    const store = useAlertsStore()
    store.notify('Temporary', 'info', { timeout: 3000 })

    expect(store.items.length).toBe(1)
    vi.advanceTimersByTime(3000)
    expect(store.items.length).toBe(0)
  })

  it('applies correct style class', () => {
    const store = useAlertsStore()
    store.notify('Styled alert', 'error', { timeout: false })

    const wrapper = mount(TheAlerts)
    const alertDiv = wrapper.find('.alert')
    expect(alertDiv.classes()).toContain('alert-error')
  })
})

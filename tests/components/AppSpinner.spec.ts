import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSpinner from '@/components/AppSpinner.vue'

describe('AppSpinner', () => {
  it('renders correctly with size "sm" and color "white"', () => {
    const wrapper = mount(AppSpinner, {
      props: {
        size: 'sm',
        color: 'white',
      },
    })

    const svg = wrapper.get('svg')
    expect(svg.classes()).toContain('w-4')
    expect(svg.classes()).toContain('h-4')
    expect(svg.classes()).toContain('text-gray-200') // special case for white
    expect(svg.classes()).toContain('fill-white') // passthrough for white

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders correctly with size "md" and color "black"', () => {
    const wrapper = mount(AppSpinner, {
      props: {
        size: 'md',
        color: 'black',
      },
    })

    const svg = wrapper.get('svg')
    expect(svg.classes()).toContain('w-8')
    expect(svg.classes()).toContain('h-8')
    expect(svg.classes()).toContain('text-gray-700') // special case for black
    expect(svg.classes()).toContain('fill-black')

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders correctly with size "lg" and color "emerald"', () => {
    const wrapper = mount(AppSpinner, {
      props: {
        size: 'lg',
        color: 'emerald',
      },
    })

    const svg = wrapper.get('svg')
    expect(svg.classes()).toContain('w-12')
    expect(svg.classes()).toContain('h-12')
    expect(svg.classes()).toContain('text-emerald-200')
    expect(svg.classes()).toContain('fill-emerald-600')

    expect(wrapper.html()).toMatchSnapshot()
  })
})

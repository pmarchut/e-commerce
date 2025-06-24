import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Cart from '@/pages/cart.vue'
import { useCartStore } from '@/stores/CartStore'

function factoryMount() {
  const cartStore = useCartStore()
  cartStore.items = [
    { 
      item: 
        { sys: { id: "2" }, 
          fields: { 
            heatLevel: 2,
            image: [{ fields: { description: "Crystal Louisiana's Pure Hot Sauce", file: { url: "//images.ctfassets.net/onnhxctx2ugw/35aaK1kC9rwIc332ew0KI4/139a676e65c1812229b6914530b00cc7/crystal.jpeg" }, title: "Crystal Louisiana's Pure Hot Sauce" } }],
            name: "Crystal Louisiana's Pure Hot Sauce",
            price: 699 
          } 
        }, 
      amount: 1 
    }, 
    { 
      item: 
        { sys: { id: "1" }, 
          fields: {
            heatLevel: 2,
            image: [{ fields: { description: "Rocky's Bacon Hot Sauce", file: { url: "//images.ctfassets.net/onnhxctx2ugw/2HhLs3KctvgwNcffXgplrn/202ddf7f55eae7eed26454ad477d0c4b/bacon.jpeg" }, title: "Rocky's Bacon Hot Sauce" } }],
            name: "Rocky's Bacon Hot Sauce ",
            price: 1199 
          } 
        }, 
      amount: 2 
    },
  ]

  const wrapper = mount(Cart, {
    global: {
      stubs: {
        NuxtLink: {
          template: '<a :href="to"><slot /></a>',
          props: ['to'],
        },
      },
    },
  })

  return { wrapper, cartStore }
}

describe('Cart.vue', () => {
  it('renders cart items from CartStore', () => {
    const { wrapper } = factoryMount()

    expect(wrapper.html()).toContain("Crystal Louisiana's Pure Hot Sauce")
    expect(wrapper.html()).toContain('$6.99')
    expect(wrapper.html()).toContain("Rocky's Bacon Hot Sauce")
    expect(wrapper.html()).toContain('$11.99')
    expect(wrapper.text()).toContain('Subtotal: $30.97')
    expect(wrapper.text()).toContain('Estimated Taxes : $3.10')
    expect(wrapper.text()).toContain('Total: $34.07')
  })

  it('checkboxes change changes selected state', async () => {
    const { wrapper } = factoryMount()
    const checkbox = wrapper.find('input[type="checkbox"][value="2"]')
    expect(wrapper.find('button.text-red-500').exists()).toBe(false)
    expect((checkbox.element as HTMLInputElement).checked).toBe(false)
    await checkbox.setValue(true)
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
    expect(wrapper.find('button.text-red-500').exists()).toBe(true)
  })

  it('select all checkbox selects and deselects all items', async () => {
    const { wrapper } = factoryMount()

    const allCheckbox = wrapper.find('thead input[type="checkbox"]') // zaznacz wszystko
    const itemCheckboxes = wrapper.findAll('tbody input[type="checkbox"]')

    // Sprawdź, że na początku nic nie jest zaznaczone
    for (const checkbox of itemCheckboxes) {
      expect((checkbox.element as HTMLInputElement).checked).toBe(false)
    }

    // Kliknij "Zaznacz wszystko"
    await allCheckbox.setValue(true)

    // Sprawdź, że wszystkie itemy są zaznaczone
    for (const checkbox of itemCheckboxes) {
      expect((checkbox.element as HTMLInputElement).checked).toBe(true)
    }

    // Kliknij ponownie, żeby odznaczyć
    await allCheckbox.setValue(false)

    for (const checkbox of itemCheckboxes) {
      expect((checkbox.element as HTMLInputElement).checked).toBe(false)
    }
  })

  it('checks checkAll checkbox if all items are selected', async () => {
    const { wrapper } = factoryMount()

    const itemCheckboxes = wrapper.findAll('tbody input[type="checkbox"]')

    for (const checkbox of itemCheckboxes) {
      await checkbox.setValue(true)
    }

    // Sprawdź, że wszystkie itemy są zaznaczone
    for (const checkbox of itemCheckboxes) {
      expect((checkbox.element as HTMLInputElement).checked).toBe(true)
    }

    const allCheckbox = wrapper.find('thead input[type="checkbox"]') // zaznacz wszystko

    // Teraz sprawdzamy czy checkAll się zaznaczyło
    expect((allCheckbox.element as HTMLInputElement).checked).toBe(true)
  })

  it('removes selected items and shows empty cart message', async () => {
    const { wrapper, cartStore } = factoryMount()

    // Zaznacz pierwszy checkbox
    const firstCheckbox = wrapper.find('input[type="checkbox"][value="2"]')
    await firstCheckbox.setValue(true)

    // Kliknij "Remove Selected"
    const removeButton = wrapper.find('button.text-red-500')
    expect(removeButton.exists()).toBe(true)
    await removeButton.trigger('click')

    // Sprawdź, że tylko jeden produkt pozostał
    expect(cartStore.items.length).toBe(1)
    expect(wrapper.html()).toContain("Rocky's Bacon Hot Sauce")
    expect(wrapper.html()).not.toContain("Crystal Louisiana's Pure Hot Sauce")

    // Zaznacz pozostały produkt
    const remainingCheckbox = wrapper.find('input[type="checkbox"][value="1"]')
    await remainingCheckbox.setValue(true)

    // Kliknij "Remove Selected" ponownie
    await wrapper.find('button.text-red-500').trigger('click')

    // Sprawdź, że koszyk jest pusty
    expect(cartStore.items.length).toBe(0)
    expect(wrapper.text()).toContain('Cart is empty')
  })
})

const cartSidebarEl = document.querySelector('.cart-sidebar');
function openSidebar (event) {
  event.stopPropagation()
  cartSidebarEl.classList.add('cart-sidebar-open');
}
function closeSidebar(){
  cartSidebarEl.classList.remove('cart-sidebar-open');
}
const btnCartEl = document.getElementById('btn-cart');
btnCartEl.addEventListener('click', openSidebar)
const btnCloseCartEl = document.querySelector('#btn-close-cart');
btnCloseCartEl.addEventListener('click', closeSidebar);
document.addEventListener('click', closeSidebar)
cartSidebarEl.addEventListener('click', (event) => {
  event.stopPropagation();
})
const btnAddMore = document.querySelector('#btn-add-more')
btnAddMore.addEventListener('click', closeSidebar)

const groupsRootEl = document.querySelector('#groups-root')
const fetchProducts = () => {
  fetch('products.json')
    .then(res => res.json())
    .then(data => {
      for (let contador = 0;contador < data.groups.length;contador++) {
        const groupSectionEl = getSectionElement(data.groups[contador])
        groupsRootEl.appendChild(groupSectionEl)
      }
    })
    .catch(() => {
    groupsRootEl.innerHTML = '<p class="error-alert">Falha ao buscar produtos. Por favor, tente novamente.</p>'
  })
}
const getSectionElement = (group) => {
  const sectionEl = document.createElement('section');
  const sectionTitleEl = document.createElement('h2');
  sectionTitleEl.textContent = group.name
  sectionEl.appendChild(sectionTitleEl);
  const productsGridEl = document.createElement('div');
  productsGridEl.classList.add('products-grid');
  sectionEl.appendChild(productsGridEl);
  group.products.forEach((product) => {
    const cardWrapEl = document.createElement('article');
    cardWrapEl.classList.add('card');
    cardWrapEl.innerHTML = `
      <img src="${product.image}" alt="${product.name}" width="316" height="193" />
      <div class="card-content">
        <h3>${product.name}</h3>
        ${product.description ? `<p>${product.description}</p>` : ''}
        <button class="btn btn-main">Adicionar</button>
      </div>
    `
    const btnAddCartEl = cardWrapEl.querySelector('button');
    btnAddCartEl.addEventListener('click', () => {
      addToCart(product)
    })
    // btnAddCartEl.addEventListener('click', openSidebar);
    productsGridEl.appendChild(cardWrapEl);
  })
  return sectionEl
}
if (groupsRootEl) {
  fetchProducts()
}

let productsCart = []
const savedProducts = localStorage.getItem('productsCart')
if (savedProducts) {
  productsCart = JSON.parse(savedProducts)
}
const addToCart = newProduct => {
  const productIndex = productsCart.findIndex(
    item => item.id === newProduct.id
  )
  if (productIndex === -1) {
    productsCart.push({
      ...newProduct,
      qty: 1
    })
  } else {
    productsCart[productIndex].qty++
  }
  handleCartUpdate()
}
const removeOfCart = id => {
  productsCart = productsCart.filter((product) => {
    if (product.id === id) {
      return false
    }
    return true
  })
  handleCartUpdate()
  if (productsCart.length === 0) {
    closeSidebar()
  }
}
const updateItemQty = (id, newQty) => {
  const newQtyNumber = parseInt(newQty)
  if (isNaN(newQtyNumber)) {
    return
  }
  if (newQtyNumber > 0) {
    const productIndex = productsCart.findIndex((product) => {
      if (product.id === id) {
        return true
      }
      return false
    })
    productsCart[productIndex].qty = newQtyNumber
    handleCartUpdate(false)
  } else {
    removeOfCart(id)
  }
}
const handleCartUpdate = (renderItens = true) => {
  const productsCartString = JSON.stringify(productsCart)
  localStorage.setItem('productsCart', productsCartString)
  const emptyCartEl = document.querySelector('#empty-cart')
  const cartWithProductsEl = document.querySelector('#cart-with-products')
  const cartProductsListEl = cartWithProductsEl.querySelector('ul')
  const cartBadgeEl = document.querySelector('.btn-cart-badge')
  if (productsCart.length > 0) {
    cartBadgeEl.classList.add('btn-cart-badge-show')
    let total = 0
    productsCart.forEach(product => {
      total = total + product.qty
    })
    cartBadgeEl.textContent = total
    cartWithProductsEl.classList.add('cart-with-products-show')
    emptyCartEl.classList.remove('empty-cart-show')
    if (renderItens) {
      cartProductsListEl.innerHTML = ''
      productsCart.forEach((product) => {
        const listItemEl = document.createElement('li')
        listItemEl.innerHTML = `
          <img src="${product.image}" alt="${product.name}" width="70" height="70" />
          <div>
            <p class="h3">${product.name}</p>
          </div>
          <input class="form-input" type="number" value="${product.qty}" />
          <button>
            <i class="fa-solid fa-trash-can"></i>
          </button>
        `
        const btnRemoveEl = listItemEl.querySelector('button')
        btnRemoveEl.addEventListener('click', () => {
          removeOfCart(product.id)
        })
        const inputQtyEl = listItemEl.querySelector('input')
        inputQtyEl.addEventListener('keyup', (event) => {
          updateItemQty(product.id, event.target.value)
        })
        inputQtyEl.addEventListener('keydown', (event) => {
          if (event.key === '-' || event.key === '.' || event.key === ',') {
            event.preventDefault()
          }
        })
        inputQtyEl.addEventListener('change', (event) => {
          updateItemQty(product.id, event.target.value)
        })
        cartProductsListEl.appendChild(listItemEl)
      })
    }
  } else {
    cartBadgeEl.classList.remove('btn-cart-badge-show')
    emptyCartEl.classList.add('empty-cart-show')
    cartWithProductsEl.classList.remove('cart-with-products-show')
    
  }
}
handleCartUpdate()
window.addEventListener('storage', (event) => {
  if (event.key === 'productsCart') {
    productsCart = JSON.parse(event.newValue)
    handleCartUpdate()
  }
})
const formCheckoutEl = document.querySelector('.form-checkout')
formCheckoutEl?.addEventListener('submit', (event) => {
  event.preventDefault()
  if (productsCart.length == 0) {
    alert('Nenhum produto no carrinho.')
    return
  }
  let text = 'Confira o pedido abaixo:\n---------------------------------------\n\n'
  let total = 0
  productsCart.forEach(product => {
    text += `*${product.qty}x ${product.name}*\n`
    total += product.qty
  })
  text += '\n*Taxa de entrega:* A combinar\n'
  text += '\n---------------------------------------\n\n'
  text += `*${formCheckoutEl.elements['input-name'].value}*\n`
  text += `${formCheckoutEl.elements['input-phone'].value}\n\n`
  text += `${formCheckoutEl.elements['input-address'].value}, ${formCheckoutEl.elements['input-number'].value}`
  const complement = formCheckoutEl.elements['input-complement'].value
  if (complement) {
    text+= ` - ${complement}`
  }
  text += `\n${formCheckoutEl.elements['input-neighborhood'].value}, ${formCheckoutEl.elements['input-city'].value}\n`
  text += formCheckoutEl.elements['input-cep'].value
  const subdomain = window.innerWidth > 768 ? 'web' : 'api'
  window.open(`https://${subdomain}.whatsapp.com/send?phone=5531973386571&text=${encodeURI(text)}`, '_blank')
})

if (typeof IMask !== 'undefined') {
  const inputPhoneEl = document.querySelector('#input-phone')
  IMask(inputPhoneEl, {
    mask: '(00) 00000-0000'
  })
  const inputCepEl = document.querySelector('#input-cep')
  IMask(inputCepEl, {
    mask: '00000-000'
  })
}

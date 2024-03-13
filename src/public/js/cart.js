const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartProducts = [];

addToCartButtons.forEach(button => {
  button.addEventListener('click', function () {
    const productId = this.getAttribute('data-product-id');
    addToCart(productId);
  });
});

async function addToCart(productId) {
  try {
    // Envia una solicitud al servidor para agregar el producto al carrito
    const response = await fetch(`/api/sessions/add-to-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });

    if (response.ok) {
      // Agrega el productId al estado local
      cartProducts.push(productId);
      showAlert('Producto agregado al carrito', 'success');
      // Renderiza los productos del carrito en la página
      renderCartProducts();
    } else {
      showAlert('Error al agregar producto al carrito', 'error');
    }
  } catch (error) {
    console.error('Error adding product to cart:', error);
    showAlert('Error al agregar producto al carrito', 'error');
  }
}


async function renderCartProducts() {
  try {
    cartItemsContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar

    // Asegúrate de que cartProducts es un array antes de continuar
    if (!Array.isArray(cartProducts)) {
      throw new Error('Invalid cart data');
    }

    // Itera sobre los productos del carrito
    for (const productId of cartProducts) {
      // Obtén los detalles del producto desde el servidor
      const productDetails = await getProductDetails(productId);

      // Renderiza el producto en el carrito
      const cartItem = document.createElement('li');
      cartItem.textContent = `${productDetails.title} - $${productDetails.price}`;
      cartItemsContainer.appendChild(cartItem);
    }
  } catch (error) {
    console.error('Error rendering cart products:', error);
    showAlert('Error al obtener los detalles del carrito', 'error');
  }
}

function showAlert(message, type) {
  Swal.fire({
    title: message,
    icon: type,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
  });
}
import { Router } from "express";
import { productsManager } from "../DAL/dao/managers/productsManager.js";
import { cartsManager } from "../DAL/dao/managers/cartsManager.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { usersManager } from "../DAL/dao/managers/usersManager.js";

const router = Router();

router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/profile");
  }

  res.render("login");
});

router.get("/signup", async (req, res) => {
  if (req.session.user) {
    return res.redirect("/profile");
  }
  res.render("signup");
});


router.get("/restore", (req, res) => {
  res.render("restore", {style: "restore"});
});


router.get("/restart/:id", (req, res) => {
  if (req.cookies.tokencito){
    const {id} = req.params  
    res.render("restart", {style: "restart", id});
  } else {
    console.log("No hay token en las cookies. Redirigiendo manualmente a /restore");
    return res.redirect("/restore")
  }
});



router.get("/profile", async (req, res) => {
  if (!req.session.passport) {
    return res.redirect("/login");
  }

  try {
    const user = req.user;
    const isAdmin = user && user.role === 'ADMIN';

    if (isAdmin) {
      const allUsers = await usersManager.findAll()
      res.render("admin-view", { allUsers });
    } else {
      const products = await productsManager.findAll({
        page: 1, 
        limit: 10, 
        sort: null, 
        query: null, 
      });
      res.render("profile", { user, products });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cargar la página de perfil' });
  }
});


router.get("/error", (req, res) => {
  const AllMessages = req.session.messages || [];
  const messages = AllMessages.length > 0 ? AllMessages[AllMessages.length - 1] : null;
  console.log('req.session', req.session);
  res.render("error", { messages, style: "error" });
});





  router.get('/chat', authMiddleware(["USER","user"]), (req, res) => {
    res.render('chat'); 
  }); 

   router.get('/products', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sort = req.query.sort || null;
      const query = req.query.query || null;
  
      const products = await productsManager.findAll({
        page,
        limit,
        sort,
        query,
      });
      res.render('products', {products});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }); 

  
  router.get('/products/:id', async (req, res) => {
    const productId = req.params.id;
  
    try {
      const product = await productsManager.findById(productId);
  
      res.render('product-details', { product });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.get('/carts/:id', authMiddleware(['USER', 'PREMIUM']), async (req, res) => {
    const userId = req.user._id;
  
    try {
      // Obtén el ID del carrito del usuario
      const user = await usersManager.findById(userId);
      const cartId = user.cart;
  
      // Obtén el carrito y los productos en el carrito
      const cart = await cartsManager.findCartById(cartId);
      const productsInCart = cart.products;
  
      res.render('cart-details', { products: productsInCart });
    } catch (error) {
      console.error('Error getting cart details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/cart', authMiddleware(['USER', 'PREMIUM']), async (req, res) => {
    const userId = req.user._id;
  
    try {
      // Obtén el ID del carrito del usuario
      const user = await usersManager.findById(userId);
      const cartId = user.cart;
  
      // Obtén el carrito y los productos en el carrito
      const cart = await cartsManager.findCartById(cartId);
      const productsInCart = cart.products;
  
      res.render('cart', { products: productsInCart });
    } catch (error) {
      console.error('Error rendering cart:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  router.get('/cart-details', authMiddleware(['USER', 'PREMIUM']), async (req, res) => {
    const userId = req.user._id;
  
    try {
      
      const user = await usersManager.findById(userId);
      const cartId = user.cart;
  
     
      const cart = await cartsManager.findCartById(cartId);
      const productsInCart = cart.products;
  
      res.render('cart-details', {productsInCart });
    } catch (error) {
      console.error('Error rendering cart details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

 
export default router;
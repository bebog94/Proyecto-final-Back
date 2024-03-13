import { usersManager } from "../DAL/dao/managers/usersManager.js";
import { productsManager } from "../DAL/dao/managers/productsManager.js";
import { cartsManager } from "../DAL/dao/managers/cartsManager.js";
import { hashData, compareData, generateToken } from "../utils/utils.js";
import { transporter } from "../utils/nodemailer.js";
import passport from "passport";
import UsersResponse from "../DAL/dtos/user-response.dto.js";

class SessionController {
  async signup(req, res, next) {
    passport.authenticate("signup", {
      successRedirect: "/profile",
      failureRedirect: "/error",
    })(req, res, next);
  }

  async login(req, res, next) {
    passport.authenticate("login", {
      failureMessage: true,
      failureRedirect: "/error",
    })(req, res, () => {
      const token = generateToken(req.user);
      res.cookie("token", token, { maxAge: 300000, httpOnly: true });
      res.redirect("/profile");
    });
  }

  async getCurrentUser(req, res, next) {
    const userDTO = new UsersResponse(req.user.user);
    res.status(200).json({ message: 'User logged', user: userDTO });
  }

  async signout(req, res, next) {
    try {
      const user = req.user;
      if (user) {
        user.last_connection = new Date();
        await user.save();
        req.session.destroy(() => {
          res.redirect("/login");
        });
      }
    } catch (error) {
      console.error("Error during signout:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async restartPassword(req, res, next) {
    const { pass, repeat } = req.body;
    const { id } = req.params;
    const user = await usersManager.findById(id);

    if (req.cookies.tokencito) {
      try {
        if (pass !== repeat) {
          return res.json({ message: "Passwords must match" });
        }
        const isPassRepeated = await compareData(pass, user.password);
        if (isPassRepeated) {
          return res.json({ message: "This password is not allowed" });
        }
        const newHashedPassword = await hashData(pass);
        user.password = newHashedPassword;
        await user.save();
        res.status(200).json({ message: "Password updated", user });
      } catch (error) {
        res.status(500).json({ error });
      }
    } else {
      console.log("No hay token en las cookies. Redirigiendo manualmente a /restore");
      return res.redirect("/restore");
    }
  }

  async restorePassword(req, res, next) {
    const { email } = req.body;
    try {
      const user = await usersManager.findByEmail(email);
      if (!user) {
        return res.send("User does not exist with the email provided");
      }
      await transporter.sendMail({
        from: "sicnetisp@gmail.com",
        to: email,
        subject: "Recovery instructions",
        html: `<b>Please click on the link below</b>
              <a href="http://localhost:8080/restart/${user._id}">Restore password</a>
        `,
      });

      const tokencito = generateToken({ email });

      res.cookie('tokencito', tokencito, { maxAge: 3600000, httpOnly: true });
      console.log("tokencito", tokencito);

      res.status(200).json({ message: "Recovery email sent" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async githubAuth(req, res, next) {
    passport.authenticate("github")(req, res, next);
  }

  async githubCallback(req, res, next) {
    passport.authenticate("github")(req, res, () => {
      res.redirect("/profile");
    });
  }
  async addToCart(req, res, next) {
    try {
      const { productId } = req.body;
      const cartId = req.user.cart;
      
      const product = await productsManager.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      await cartsManager.addProductToCart(cartId, product._id);
  
      res.status(200).json({ message: "Product added to cart successfully" });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getCartDetails(req, res, next) {
    try {
        console.log(req.user._id);
      const userId = req.user._id; 

      const cartDetails = await cartsManager.getCartDetails(userId);

      res.status(200).json({ cartDetails });
    } catch (error) {
      console.error("Error getting cart details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
} 

export default new SessionController();
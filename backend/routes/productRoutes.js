const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const productController = require("../controllers/productController.js");

// Routes
router.post("/", upload.array("images"), productController.addProduct);  // Add images
router.post("/", productController.addProduct);           // Add product
router.get("/", productController.getProducts);          // Get all products
router.get("/:id", productController.getProduct);        // Get single product
router.put("/:id", productController.updateProduct);     // Update product
router.delete("/:id", productController.deleteProduct);  // Delete product


module.exports = router;

//* backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const productController = require("../controllers/productController.js");

// Routes

router.post("/", upload.array("images"), productController.addProduct); 
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// Added multer middleware to the PUT route to accept new images
router.put("/:id", upload.array("images"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

// Route to toggle stock status
router.patch("/:id/stock", productController.toggleStockStatus);

module.exports = router;
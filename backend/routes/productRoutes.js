
const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const productController = require("../controllers/productController.js");

// --- Routes ---

router.post(
  "/",
  // protect admin,
  upload.array("images", 3),
  productController.addProduct
);

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);


router.put(
  "/:id/status",
  productController.updateStockStatus
);


router.put(
  "/:id",
  upload.array("images", 3),
  productController.updateProduct
);


router.delete(
  "/:id",
  productController.deleteProduct
);

module.exports = router;
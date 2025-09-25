// backend/controllers/productController.js

const Product = require("../models/Products.js");
const cloudinary = require('../config/cloudinary.js');
const streamifier = require("streamifier");


// This helper function can be reused for both add and update
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
                if (error) return reject(error);
                resolve({ secure_url: result.secure_url, public_id: result.public_id });
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};


// Add Product (No changes needed here)
exports.addProduct = async (req, res) => {
    try {
        const { name, description, category, sizes } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Images are required" });
        }
        
        const uploadedImages = [];
        const uploadedPublicIds = [];

        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer);
            uploadedImages.push(result.secure_url);
            uploadedPublicIds.push(result.public_id);
        }

        const product = await Product.create({
            name,
            description,
            category,
            sizes: JSON.parse(sizes),
            images: uploadedImages,
            imagePublicIds: uploadedPublicIds,
        });

        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Server error" });
    }
};


// Get all products (No changes needed)
exports.getProducts = async (req, res) => {
    // ... same code
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
      }
};

// Get single product by ID (No changes needed)
exports.getProduct = async (req, res) => {
    // ... same code
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json(product);
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
      }
};

// MODIFIED: Complete overhaul of the updateProduct function
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const { name, description, category, sizes, imagesToRemove } = req.body;

        // 1. Delete images from Cloudinary if requested
        if (imagesToRemove) {
            const urlsToRemove = JSON.parse(imagesToRemove);
            if (urlsToRemove.length > 0) {
                // Find the public_ids corresponding to the URLs
                const publicIdsToRemove = [];
                product.images.forEach((imageUrl, index) => {
                    if (urlsToRemove.includes(imageUrl)) {
                        publicIdsToRemove.push(product.imagePublicIds[index]);
                    }
                });

                // Delete from Cloudinary
                for (const publicId of publicIdsToRemove) {
                    await cloudinary.uploader.destroy(publicId);
                }
                
                // Remove from product document
                product.images = product.images.filter(img => !urlsToRemove.includes(img));
                product.imagePublicIds = product.imagePublicIds.filter(id => !publicIdsToRemove.includes(id));
            }
        }

        // 2. Upload new images to Cloudinary if they exist
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer);
                product.images.push(result.secure_url);
                product.imagePublicIds.push(result.public_id);
            }
        }
        
        // 3. Update text fields and sizes
        product.name = name || product.name;
        product.description = description || product.description;
        product.category = category || product.category;
        if (sizes) {
            product.sizes = JSON.parse(sizes);
        }

        const updatedProduct = await product.save();
        
        res.status(200).json({ success: true, product: updatedProduct });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete product (No changes needed)
exports.deleteProduct = async (req, res) => {
    // ... same code
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        // Delete images from Cloudinary
        for (const public_id of product.imagePublicIds) {
          await cloudinary.uploader.destroy(public_id);
        }

        // Delete product from DB
        await product.deleteOne();

        res.status(200).json({ success: true, message: "Product and images deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
      }
};

// Update product stock status
exports.updateStockStatus = async (req, res) => {
  try {

    const { status } = req.body;
    const validStatuses = ['IN_STOCK', 'OUT_OF_STOCK', 'BOOKING_CLOSED'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status provided" });
    }

   
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.stock_status = status; 
    await product.save();
    res.status(200).json({ success: true, message: "Status updated successfully", product });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
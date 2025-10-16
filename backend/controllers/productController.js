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


// Add Product 
exports.addProduct = async (req, res) => {
    try {
        const { style_code, name, description, category, metal_pagdi, marble_pagdi, metal_sizes, marble_sizes, colour, pagdi } = req.body;

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
            style_code,
            name,
            pagdi,
            description,
            category,
            colour,
            metal_pagdi: JSON.parse(metal_pagdi),
            marble_pagdi: JSON.parse(marble_pagdi),
            metal_sizes: JSON.parse(metal_sizes),
            marble_sizes: JSON.parse(marble_sizes),
            images: uploadedImages,
            imagePublicIds: uploadedPublicIds,
        });

        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Server error" });
    }
};


// Get all products 
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

// Get single product by ID 
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json(product);
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
      }
};

// Complete overhaul of the updateProduct function
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const {style_code, name, pagdi, description, category, colour, metal_pagdi, marble_pagdi, metal_sizes, marble_sizes, imagesToRemove } = req.body;

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
        product.style_code = style_code || product.style_code
        product.name = name || product.name;
        product.pagdi = pagdi || product.pagdi;
        product.description = description || product.description;
        product.category = category || product.category;
        product.colour = colour || product.colour;
        if (metal_pagdi) {
            product.metal_pagdi = JSON.parse(metal_pagdi);
        }
        if (marble_pagdi) {
            product.marble_pagdi = JSON.parse(marble_pagdi);
        }
        if (marble_sizes) {
            product.marble_sizes = JSON.parse(marble_sizes);
        }
        if (metal_sizes) {
            product.metal_sizes = JSON.parse(metal_sizes);
        }

        const updatedProduct = await product.save();
        
        res.status(200).json({ success: true, product: updatedProduct });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
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
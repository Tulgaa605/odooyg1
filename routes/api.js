const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const searchController = require('../controllers/searchController');
const paymentController = require('../controllers/paymentController');

// Multer тохиргоо
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Auth routes (хамгаалалт шаардлагагүй)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// User routes (токен шаардлагатай)
router.get('/users/:userId', authMiddleware, userController.getUserProfile);

// Product routes (токен шаардлагатай)
router.get('/products', authMiddleware, productController.getProducts);
router.post('/products', authMiddleware, productController.createProduct);

// Category routes (токен шаардлагатай)
router.get('/categories', authMiddleware, categoryController.getCategories);

// Post routes (токен шаардлагатай)
router.get('/posts', authMiddleware, postController.getPosts);
router.post('/posts', authMiddleware, upload.array('images', 10), postController.createPost);

// Comment routes (токен шаардлагатай)
router.post('/comments', authMiddleware, commentController.createComment);

// Like routes (токен шаардлагатай)
router.post('/likes', authMiddleware, likeController.likePost);
router.delete('/likes/:postId', authMiddleware, likeController.unlikePost);

// Search routes
router.get('/search', authMiddleware, searchController.search);

// Payment routes
router.post('/payments/create', paymentController.createPayment);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
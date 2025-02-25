const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: true, comments: true, likes: true },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPost = async (req, res) => {
    const { description } = req.body;
    const image = req.file ? `http://192.168.88.201:5000/uploads/${req.file.filename}` : null; // Бүрэн URL
    try {
      const post = await prisma.post.create({
        data: { description, authorId: req.userId, image },
      });
      res.status(201).json(post);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  };
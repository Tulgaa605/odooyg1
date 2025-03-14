const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { 
        author: true, 
        comments: true, 
        likes: true 
      },
      orderBy: {
        createdAt: 'desc'
      },
      distinct: ['id']
    });
    console.log('Бүх постууд:', posts);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { description, location, category } = req.body;
    console.log('Request files:', req.files); // Logging for debugging
    
    // Зургийн URL-ийг бүрэн замтай үүсгэх
    const images = req.files 
      ? req.files.map(file => `http://192.168.1.26:5000/uploads/${file.filename}`)
      : [];

    console.log('Image URLs:', images); // Logging for debugging

    const post = await prisma.post.create({
      data: {
        description,
        images,
        location: location || '',
        category: category || '',
        authorId: req.userId,
      },
      include: {
        author: true,
        comments: true,
        likes: true
      }
    });
    
    console.log('Created post:', post);
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: error.message });
  }
};
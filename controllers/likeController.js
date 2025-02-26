const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Like хийх
exports.likePost = async (req, res) => {
  const { postId } = req.body;
  const userId = req.userId;

  try {
    // Өмнө нь like дарсан эсэхийг шалгах
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Аль хэдийн like дарсан байна' });
    }

    // Шинэ like үүсгэх
    const like = await prisma.like.create({
      data: {
        userId: userId,
        postId: postId
      }
    });

    // Like-ын тоог авах
    const likesCount = await prisma.like.count({
      where: { postId: postId }
    });

    res.status(201).json({
      ...like,
      likesCount
    });

  } catch (error) {
    console.error('Like error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Unlike хийх
exports.unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    // Like устгах
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId
        }
      }
    });

    // Like-ын тоог авах
    const likesCount = await prisma.like.count({
      where: { postId: postId }
    });

    res.json({
      removed: true,
      postId,
      likesCount
    });

  } catch (error) {
    console.error('Unlike error:', error);
    res.status(400).json({ error: error.message });
  }
};
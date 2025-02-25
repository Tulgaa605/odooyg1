const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.likePost = async (req, res) => {
  console.log('Хүсэлтийн бие:', req.body);
  console.log('Хэрэглэгчийн ID:', req.userId);
  const { postId } = req.body;

  try {
    // Хэрэглэгчийн ID-г шалгах
    if (!req.userId) {
      throw new Error('Хэрэглэгчийн ID олдсонгүй');
    }
    // Постын ID-г шалгах
    if (!postId) {
      throw new Error('Постын ID олдсонгүй');
    }

    // Пост байгаа эсэхийг шалгах
    const postExists = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!postExists) {
      throw new Error(`"${postId}" ID-тай пост олдсонгүй`);
    }

    // Хэрэглэгч аль хэдийн лайк дарсан эсэхийг шалгах (@@unique хязгаарлалтыг ашиглана)
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.userId,
          postId: postId,
        },
      },
    });
    if (existingLike) {
      throw new Error('Та энэ постыг аль хэдийн лайк дарсан байна');
    }

    // Шинэ лайк үүсгэх
    const like = await prisma.like.create({
      data: {
        userId: req.userId,
        postId: postId,
      },
    });

    res.status(201).json(like);
  } catch (error) {
    console.error('Лайкийн алдаа:', error.message);
    res.status(400).json({ error: error.message });
  }
};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createComment = async (req, res) => {
  const { content, postId, parentId } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: { content, authorId: req.userId, postId, parentId },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
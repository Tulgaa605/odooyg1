const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ include: { products: true } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
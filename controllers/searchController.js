const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.search = async (req, res) => {
  try {
    const {
      query,          // Хайх текст
      type,           // posts, users, products гэх мэт
      category,       // Ангилал
      priceRange,     // Үнийн хязгаар [min, max]
      location,       // Байршил
      sortBy,         // Эрэмбэлэх (latest, popular)
      page = 1,       // Хуудас
      limit = 10      // Хуудсанд харуулах тоо
    } = req.query;

    const skip = (page - 1) * limit;

    let results = [];
    let total = 0;

    // Хайлтын нөхцөлүүд
    const baseConditions = query ? {
      OR: [
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
      ]
    } : {};

    // Нэмэлт шүүлтүүр
    const filters = {
      ...(category && { category }),
      ...(location && { location }),
      ...(priceRange && {
        price: {
          gte: parseFloat(priceRange[0]),
          lte: parseFloat(priceRange[1])
        }
      })
    };

    // Эрэмбэлэх
    const orderBy = sortBy === 'popular' 
      ? { likes: { _count: 'desc' } }
      : { createdAt: 'desc' };

    switch (type) {
      case 'posts':
        [results, total] = await Promise.all([
          prisma.post.findMany({
            where: {
              ...baseConditions,
              ...filters
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true
                }
              },
              _count: {
                select: {
                  likes: true,
                  comments: true
                }
              }
            },
            orderBy,
            skip,
            take: limit
          }),
          prisma.post.count({
            where: {
              ...baseConditions,
              ...filters
            }
          })
        ]);
        break;

      case 'products':
        [results, total] = await Promise.all([
          prisma.product.findMany({
            where: {
              ...baseConditions,
              ...filters
            },
            include: {
              category: true
            },
            orderBy,
            skip,
            take: limit
          }),
          prisma.product.count({
            where: {
              ...baseConditions,
              ...filters
            }
          })
        ]);
        break;

      case 'users':
        [results, total] = await Promise.all([
          prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            },
            select: {
              id: true,
              name: true,
              profileImage: true,
              _count: {
                select: {
                  posts: true,
                  followers: true
                }
              }
            },
            skip,
            take: limit
          }),
          prisma.user.count({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            }
          })
        ]);
        break;
    }

    res.json({
      results,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
}; 
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
});

const SOURCES = [
  {
    name: 'Vogue',
    url: 'https://www.vogue.com/rss',
  },
  {
    name: 'Hypebeast',
    url: 'https://hypebeast.com/tags/fashion/rss',
  },
  {
    name: 'FashionBeans',
    url: 'https://www.fashionbeans.com/feed/',
  },
];

const normalizeItems = (items, source) =>
  (items || []).map((item) => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate || item.isoDate || null,
    source,
  }));

// @desc    Get latest fashion trends
// @route   GET /api/trends
// @access  Public
exports.getTrends = async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const collected = [];

  await Promise.all(
    SOURCES.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        collected.push(...normalizeItems(feed.items, source.name));
      } catch (error) {
        console.error(`Trend feed error (${source.name}):`, error.message);
      }
    })
  );

  const unique = Array.from(
    new Map(collected.map((item) => [item.link, item])).values()
  );

  unique.sort((a, b) => {
    const aDate = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const bDate = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return bDate - aDate;
  });

  res.json({
    success: true,
    data: unique.slice(0, limit),
  });
};

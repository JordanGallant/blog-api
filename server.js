// server.js (as ESM)
import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import cors from 'cors';

const app = express();
const PORT = 3000;
const POSTS_DIR = path.join(process.cwd(), 'posts');

const corsOptions = {
  origin: '*',
};
app.use(cors(corsOptions));

// List all posts (metadata only)
app.get('/posts', async (req, res) => {
  const files = await fs.readdir(POSTS_DIR);
  const posts = await Promise.all(
    files.filter(f => f.endsWith('.mdx')).map(async filename => {
      const filePath = path.join(POSTS_DIR, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data } = matter(fileContent);
      return { ...data, slug: data.slug || filename.replace(/\.mdx$/, '') };
    })
  );
  res.json(posts);
});

// Get single post with raw MDX content
app.get('/posts/:slug', async (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);

  if (!await fs.pathExists(filePath)) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { content, data } = matter(fileContent);

  res.json({
    metadata: data,
    content, // Raw MDX content for frontend to compile/render
  });
});

app.listen(PORT, () => {
  console.log(`Blog API running at http://localhost:${PORT}`);
});

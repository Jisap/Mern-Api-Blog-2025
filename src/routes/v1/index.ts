
import { Router } from 'express';
import authRoutes from '@/routes/v1/auth';
import userRoutes from '@/routes/v1/user';
import blogRoutes from '@/routes/v1/blog';
import likeRoutes from '@/routes/v1/like';
import commentRoutes from '@/routes/v1/comment';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: "API is live",
    status: 'ok',
    version: '1.0.0',
    docs: 'https://docs.blog-api.codewithsadee.com',
    timeStamp: new Date().toISOString(),
  })
})

router.use('/auth', authRoutes);
router.use('/users', userRoutes); // localhost:3000/api/vi/users/current
router.use('/blogs', blogRoutes);
router.use('/likes', likeRoutes);
router.use('/comments', commentRoutes);


export default router;
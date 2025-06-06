
import { time, timeStamp } from 'console';
import { Router } from 'express';
import authRoutes from '@/routes/v1/auth';
import config from '@/config'

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

export default router;
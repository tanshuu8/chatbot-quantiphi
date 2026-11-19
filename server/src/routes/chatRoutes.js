import { Router } from 'express';
import {
  sendMessageStream,
  regenerateResponseStream,
} from '../controllers/chatController.js';

const router = Router();

router.post('/:id', sendMessageStream);
router.post('/:id/regenerate', regenerateResponseStream);

export default router;

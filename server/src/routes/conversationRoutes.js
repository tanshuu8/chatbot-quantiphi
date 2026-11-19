import { Router } from 'express';
import {
  createConversationController,
  listConversationsController,
  getConversationController,
  deleteConversationController,
  updateConversationController,
} from '../controllers/conversationController.js';

const router = Router();

router.post('/', createConversationController);
router.get('/', listConversationsController);
router.get('/:id', getConversationController);
router.delete('/:id', deleteConversationController);
router.patch('/:id', updateConversationController);

export default router;

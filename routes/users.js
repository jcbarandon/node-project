import express from 'express';

import { getUsers, createUser, getUser, deleteUser, updateUser } from '../controllers/users.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(getUsers));

router.post('/', asyncHandler(createUser));

router.get('/:id', asyncHandler(getUser));

router.delete('/:id', asyncHandler(deleteUser));

router.patch('/:id', asyncHandler(updateUser));

export default router;

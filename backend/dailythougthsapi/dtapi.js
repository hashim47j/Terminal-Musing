// dtapi.js
import express from 'express';
import processAPI from './processapi.js';
import thoughtManageAPI from './thoughtmanageapi.js';
import getLikes from './getlikes.js';
import getApproved from './getapproved.js'; // ✅ This is crucial



const router = express.Router();

router.use('/', processAPI);
router.use('/', thoughtManageAPI);
router.use('/', getLikes);
router.use('/', getApproved); // ✅ Mounts /approved

export default router;
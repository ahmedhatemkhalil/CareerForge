import express from 'express';
const router = express.Router();

import { oauthLoginOrRegister, linkOauthAccount, unlinkOauthAccount } from '../Oauth/oauthController.js';
import { verifyToken } from '../../middleware/auth.js'; 


router.post('/oauth/:provider', oauthLoginOrRegister);
router.post('/oauth/:provider/link', verifyToken, linkOauthAccount);
router.delete('/oauth/:provider/unlink', verifyToken, unlinkOauthAccount);

export default router;
import express, { Request, Response } from 'express';
import getAccessToken from '../utils/accessToken';

const router = express.Router();

router.get('/accessToken', async (req: Request, res: Response) => {
    try {
        const accessToken = await getAccessToken();
        console.log('accessToken: ', accessToken);
        if (!accessToken) {
            return res.send({ error: 'Failed to retrieve access token' });
        }
        res.json({ accessToken });
    } 
    catch (error) {
        console.error('Error in /auth route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
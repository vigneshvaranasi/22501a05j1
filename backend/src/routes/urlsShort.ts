import express, { Request, Response } from 'express';
const router = express.Router();
type clickedData = {
    timestamp: number;
    source: string;
    location: string;
}
interface URLData {
    url: string;
    validity: number;
    shortcode: string;
    createdAt: number;
    clicks: number;
    clickedData?: clickedData[];
}

let allURLs: { [key: string]: URLData } = {};
router.post('/', async (req: Request, res: Response) => {
    try {
        const { url, validity, shortcode } = req.body;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'Invalid URL parameter. URL is required and must be a string.' });
        }        
        let shortCode: string;
        if (shortcode) {
            if (typeof shortcode !== 'string' || shortcode.length < 4 || shortcode.length > 10) {
                return res.status(400).json({ error: 'Shortcode must be a string between 4-10 characters' });
            }
            if (allURLs[shortcode]) {
                return res.status(409).json({ error: 'Shortcode already exists. Please choose a different one.' });
            }            
            shortCode = shortcode;
        } 
        else {
            let attempts = 0;
            const maxAttempts = 10;
            do {
                shortCode = Math.random().toString(36).substring(2, 8);
                attempts++;
                
                if (attempts >= maxAttempts) {
                    return res.status(500).json({ error: 'Unable to generate unique short code, please try again' });
                }
            } while (allURLs[shortCode]);
        }
        
        let validityDuration: number;
        if (validity !== undefined) {
            if (typeof validity !== 'number' || validity <= 0) {
                return res.status(400).json({ error: 'Validity must be a positive number' });
            }
            validityDuration = validity * 60;
        } else {
            validityDuration = 30 * 60
        }
        
        const currentTime = Math.floor(Date.now() / 1000);
        const expiryTime = currentTime + validityDuration;
        allURLs[shortCode] = {
            url: url,
            validity: expiryTime,
            shortcode: shortCode,
            createdAt: currentTime,
            clicks: 0
        };
        
        res.status(201).json({ 
            "shortLink": `http://localhost:5000/shorturls/${shortCode}`,
            "expiry": new Date(expiryTime * 1000).toISOString()
        });

    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/allurls', async (req: Request, res: Response) => {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        
        const urlsList = Object.keys(allURLs).map(shortCode => {
            const urlData = allURLs[shortCode];
            return {
                shortcode: urlData.shortcode,
                originalUrl: urlData.url,
                shortLink: `http://localhost:5000/shorturls/${shortCode}`,
                createdAt: new Date(urlData.createdAt * 1000).toISOString(),
                expiryDate: new Date(urlData.validity * 1000).toISOString(),
                totalClicks: urlData.clicks,
                clickData: urlData.clickedData || [],
                isExpired: currentTime > urlData.validity,
                timeRemaining: Math.max(0, urlData.validity - currentTime)
            };
        });
        
        // Sort by creation date (newest first)
        urlsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        res.json({
            urls: urlsList,
            totalUrls: urlsList.length,
            activeUrls: urlsList.filter(url => !url.isExpired).length,
            expiredUrls: urlsList.filter(url => url.isExpired).length
        });
        
    } catch (error) {
        console.error('Error fetching all URLs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/stats/:shortCodeStats', async (req: Request, res: Response) => {
    try {
        const { shortCode } = req.params;        
        if (!allURLs[shortCode]) {
            return res.status(404).json({ error: 'Short URL not found' });
        }
        const urlData = allURLs[shortCode];
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (currentTime > urlData.validity) {
            return res.status(410).json({ error: 'Short URL has expired' });
        }
        
        res.json({
            shortcode: urlData.shortcode,
            originalUrl: urlData.url,
            createdAt: new Date(urlData.createdAt * 1000).toISOString(),
            expiryDate: new Date(urlData.validity * 1000).toISOString(),
            totalClicks: urlData.clicks,
            clickData: urlData.clickedData || [],
            isExpired: currentTime > urlData.validity,
            timeRemaining: Math.max(0, urlData.validity - currentTime)
        });
        
    } catch (error) {
        console.error('Error in statistics route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:shortCode', async (req: Request, res: Response) => {
    try {
        const { shortCode } = req.params;
        
        if (!allURLs[shortCode]) {
        }
        
        const urlData = allURLs[shortCode];
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (currentTime > urlData.validity) {
        }
        const referer = req.headers['referer'] || 'Direct';
        const clickData: clickedData = {
            timestamp: currentTime,
            source: referer,
            location: 'Web'
        };
        
        allURLs[shortCode].clicks += 1;
        if (!allURLs[shortCode].clickedData) {
            allURLs[shortCode].clickedData = [];
        }
        allURLs[shortCode].clickedData!.push(clickData);
        res.redirect(302, urlData.url);
        
    } catch (error) {
        console.error('Error in redirect route:', error);
    }
});



export default router;

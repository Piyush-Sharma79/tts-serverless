if (process.env.NODE_ENV !== 'production') {
    (async () => {
        const dotenv = await import('dotenv');
        dotenv.config();
    })();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Manually parse the JSON body
    let body = '';
    try {
        body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', (chunk) => {
                data += chunk;
            });
            req.on('end', () => {
                resolve(JSON.parse(data));
            });
            req.on('error', (err) => {
                reject(err);
            });
        });
    } catch (error) {
        console.error('Error parsing request body:', error);
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const { text, target } = body;
    if (!text || !target) {
        return res.status(400).json({ error: 'Missing text or language' });
    }

    const apiUrl = `https://translate.google.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        const translatedText = data[0][0][0]; // Extracting translated text
        res.status(200).json({ translatedText });
    } catch (error) {
        console.error('Error in API call:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

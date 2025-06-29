`javascript
   // pages/api/bolt-webhook.js
   import bolt from '@boltcommerce/bolt-node';

   export default async function handler(req, res) {
     const isValid = bolt.verifyWebhook(
       req.body,
       req.headers['x-bolt-signature'],
       process.env.BOLT_SIGNING_SECRET
     );
     
     if (!isValid) return res.status(401).send('Invalid signature');
     // Process webhook
   }
   ```

---

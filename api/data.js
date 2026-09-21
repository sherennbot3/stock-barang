import { MongoClient } from 'mongodb';

const DATABASE_NAME = 'stok_barang';
const COLLECTION_NAME = 'app_state';
const DOCUMENT_ID = 'main';
let clientPromise;

function getClient() {
  const uri = process.env.MONGODB_URI?.trim().replace(/^['"]|['"]$/g, '');
  if (!uri) throw new Error('MONGODB_URI is not configured');
  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }
  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  return clientPromise;
}

function validData(data) {
  return data && Array.isArray(data.items) && Array.isArray(data.hist) && data.set && typeof data.set === 'object';
}

export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'PUT') {
    response.setHeader('Allow', 'GET, PUT');
    return response.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.MONGODB_URI) return response.status(503).json({ error: 'MONGODB_URI is not configured' });

  try {
    const client = await getClient();
    const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
    if (request.method === 'GET') {
      const result = await collection.findOne({ _id: DOCUMENT_ID });
      return response.status(200).json(result ? { data: result.payload, updatedAt: result.updatedAt } : { data: null });
    }
    if (!validData(request.body) || JSON.stringify(request.body).length > 5_000_000) {
      return response.status(400).json({ error: 'Invalid data payload' });
    }
    await collection.updateOne(
      { _id: DOCUMENT_ID },
      { $set: { payload: request.body, updatedAt: new Date() } },
      { upsert: true }
    );
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Database request failed', error);
    return response.status(500).json({ error: 'Database request failed' });
  }
}

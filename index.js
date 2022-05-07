const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0dn1k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();
        const productCollection = client.db('gymniac').collection('product');
        const stockCollection = client.db('gymniac').collection('stock');

        //Products GET API
        app.get('/products', async (req, res)=>{
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/products/:id', async(req, res)=>{
            const id = req.params.id;
            console.log(id);
            const query = {_id: ObjectId(id)};
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        //POST
        app.post('/products', async (req, res)=>{
            const newProduct = req.body;
            const product = await productCollection.insertOne(newProduct);
            res.send(product);
        });
        app.post('/stock', async (req, res)=>{
            const newStock = req.body;
            const stock = await stockCollection.insertOne(newStock);
            res.send(stock);
        });
    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Server is running swiftly.");
});

app.listen(port, ()=>{
    console.log("Port no: ", port);
});
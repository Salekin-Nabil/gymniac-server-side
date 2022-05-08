const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0dn1k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();
        const productCollection = client.db('gymniac').collection('product');

        //JWT
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })
        //Products GET API All Items
        app.get('/products', async (req, res)=>{
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        //Products GET API 6 Items
        app.get('/products_6', async (req, res)=>{
            const cursor = productCollection.find({}).limit(6);
            const products = await cursor.toArray();
            res.send(products);
        });
        //Single Product GET API
        app.get('/products/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await productCollection.findOne(query);
            res.send(product);
        });
        //Products GET API My Items
        app.get('/myProducts', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const supplier = req.query.supplier;
            console.log(supplier);
            if (supplier === decodedEmail) {
                const query = { supplier: supplier };
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            }
            else{
                res.status(403).send({message: 'forbidden access'})
            }
        })
        //Products POST API
        app.post('/products', async (req, res)=>{
            const newProduct = req.body;
            const product = await productCollection.insertOne(newProduct);
            res.send(product);
        });
        //Update Quantity PUT API
        app.put('/products/:id', async(req, res)=>{
            const id = req.params.id;
            const updateProduct = req.body;
            const query = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updateProduct.quantity
                }
            };
            const result = await productCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        });
        //Products DELETE API
        app.delete('/products/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const products = await productCollection.deleteOne(query);
            res.send(products);
        })
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
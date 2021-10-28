const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.om5y9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("volunteerDB");
        const serviceCollection = database.collection("services");
        const eventCollection = database.collection('events');

        // get service api
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        //get events api
        app.get('/events', async (req, res) => {
            const cursor = eventCollection.find({});
            const events = await cursor.toArray();
            res.send(events);
        })

        //get single service Api by id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //Add Events api
        app.post('/events', async (req, res) => {
            const event = req.body;
            const result = await eventCollection.insertOne(event);
            res.json(result);
        })

        //get single event Api by id
        app.get('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const event = await eventCollection.findOne(query);
            res.json(event);
        })

        // delete event from admin
        //delete Api
        app.delete('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await eventCollection.deleteOne(query);

            res.json(result);
        })


        // update status
        app.put('/events/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };

            const event = req.body;
            console.log(event);
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'Approved'
                },
            };
            const result = await eventCollection.updateOne(filter, updateDoc, options);

            res.json(result);


        })


    }

    finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
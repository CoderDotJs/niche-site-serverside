const express = require('express')
const app = express()
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require("mongodb");
require('dotenv').config()
const port = process.env.PORT || 5000


app.use(express.json())
app.use(cors())


app.get('/', (req, res) =>{
  res.send('TravelGo server running')
})

// https://boiling-sierra-33157.herokuapp.com

// Replace the uri string with your MongoDB deployment's connection string.
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xuibt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    // db and collection for services 
    const AllListings = client.db('AllListings');
    const listingCollection = AllListings.collection('listing');
    //db and collection for placeorder 
    const ordersCollection = AllListings.collection('orders')
    const reviewCollection = AllListings.collection('reviews')
    const usersCollection = AllListings.collection('users')

    //get api
    app.get('/services', async (req, res)=>{
      const collection = listingCollection.find({});
      const service = await collection.toArray()
      res.send(service)
    })

    //get method for getting the services

    app.get('/services/place-order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await listingCollection.findOne(query);
      res.send(service);
    })

    //place order post method

    app.post('/place-order', async (req, res)=>{
      const newOrder = req.body;
      const result = await ordersCollection.insertOne(newOrder);
      console.log(newOrder)
      res.json(result);
      res.send(res.json(result))
    })

    //get method to show the ordered thinks

    app.get('/all-orders', async (req, res)=>{
      const collection = ordersCollection.find({})
      const orders = await collection.toArray()
      res.send(orders)
    })

    //delete mathod for manage my orders

    app.delete('/cancel-order/:id', async (req, res)=>{
        const id = req.params.id.trim();
        const query = { _id: ObjectId(id)}
        const del = await ordersCollection.deleteOne(query);
        console.log('deleting the user', query)
        res.json(del)
    })

    //put method to update staus on manage orders

    app.put('/update-status/:id', async (req, res)=>{
      const id = req.params.id;
        const updatedOrder = req.body;
        const filter = { _id: ObjectId(id)}
        const updateDoc = {
          $set: {
            status: updatedOrder.status
          }
        }
        const options = { upsert: true }
      const result = await ordersCollection.updateOne(filter, updateDoc, options)
      console.log('updating user: ', updatedOrder);
      res.json(result)
    })

    //get method for get data form orders 

    app.get('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await ordersCollection.findOne(query);
      res.send(service);
    })

    //post method to add new service

    app.post('/add-new-services', async (req, res)=>{
      const newService = req.body;
      const result = await listingCollection.insertOne(newService);
      console.log(newService)
      res.json(result);
      res.send(res.json(result))
    })


    // add review post method 

    app.post('/add-review', async (req, res)=>{
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      console.log(newReview)
      res.json(result);
      res.send(res.json(result))
    })

    //get api
    app.get('/get-reivew', async (req, res)=>{
      const collection = reviewCollection.find({});
      const reviews = await collection.toArray()
      res.send(reviews)
    })


    //handle register and loged in user to add to db

    app.put('/add-to-db', async (req, res)=>{
      const user = req.body;
      const email = user.email;
      console.log('user loged in', user)
      const query = { email: email };
      const update = { $set: user };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(query, update, options);
      res.send(result)
    })

    //get user  form db
    app.get('/db-user', async (req, res)=>{
      const email = req.query.email;
      console.log(email)
      const query = { email: email };
      console.log(query)
      const collection = await usersCollection.findOne(query);
      console.log(collection)
      res.send(collection)
    })

    //make admin api 
    app.put('/make-admin', async (req, res)=>{
      const user = req.body;
      const email = user.email;
      console.log('user loged in', user)
      const query = { email: email };
      const update = { 
        $set: {
          isAdmin: true,
        }
      };
      const options = { upsert: false };
      const result = await usersCollection.updateOne(query, update, options);
      res.send(result)
    })


    //get method to show the ordered thinks

    app.get('/my-orders', async (req, res)=>{
      const email = req.query.email;
      console.log(email)
      const query = { email: email };
      console.log(query)
      const collection = ordersCollection.find(query);
      const orders = await collection.toArray()
      res.send(orders)
    })


    //delete apartments

    app.delete('/delete/:id', async (req, res) =>{
      const id = req.params.id.trim();
      const query = { _id: ObjectId(id)}
      const del = await listingCollection.deleteOne(query);
      console.log('deleting the collection', query)
      res.json(del)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
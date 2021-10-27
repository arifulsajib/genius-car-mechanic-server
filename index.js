const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const objectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.19q2o.mongodb.net:27017,cluster0-shard-00-01.19q2o.mongodb.net:27017,cluster0-shard-00-02.19q2o.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-9mitof-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db("genius-car-db");
    const serviceCollection = database.collection("services");

    // get all services api
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // get single service
    app.get("/services/:id", async (req, res) => {
      const paramId = req.params.id;
      const query = { _id: objectId(paramId) };
      const service = await serviceCollection.findOne(query);
      console.log("getting service");
      res.json(service);
    });

    // post  api
    app.post("/services", async (req, res) => {
      console.log("hitting server");
      const service = req.body;

      const result = await serviceCollection.insertOne(service);
      console.log(result);
      res.json(result);
    });

    // delete api
    app.delete("/services/:id", async (req, res) => {
      const paramId = req.params.id;
      const query = { _id: objectId(paramId) };
      const result = await serviceCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Genius car mechanic server");
});

app.listen(port, () => {
  console.log("listening to port ", port);
});

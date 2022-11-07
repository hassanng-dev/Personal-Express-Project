const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const mongo = require("mongodb")
// this is to override form request
const methodOverride = require('method-override')

var db, collection;

const url =
  "mongodb+srv://HassanNgDev:Has0424686!@cluster0.fpl4oh8.mongodb.net/shoppinglist?retryWrites=true&w=majority";
const dbName = "shoppinglist";

app.listen(3000, () => {
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (error, client) => {
      if (error) {
        throw error;
      }
      db = client.db(dbName);
      console.log("Connected to `" + dbName + "`!");
    }
  );
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
// this is to override form request
app.use(methodOverride("_method"))

app.get("/", (req, res) => {
  
  db.collection("items")
    .find()
    .toArray((err, result) => {
      
      if (err) return console.log(err);
      res.render("index.ejs", { messages: result });
    });
});

app.post("/messages", (req, res) => {
  db.collection("items").insertOne(
    { name: req.body.name, department: req.body.department, check: false },
    (err, result) => {
      if (err) return console.log(err);
      console.log("saved to database");
      console.log(req.body);
      res.redirect("/");
    }
  );
});

app.put("/check", (req, res) => {
  console.log(req.body.check)
  const check = req.body.check == 'true' ? true: false
  console.log(check)
  db.collection("items").findOneAndUpdate(
    { _id: mongo.ObjectID(req.body.grabId)},
    {
      $set: {
        check: check,
        
      },
    },
    {
      sort: { _id: -1 },
      upsert: true,
    },
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

app.put("/edit/:id", (req, res) => {
  console.log(req.body.name)
  console.log(req.body.department)
  console.log(req.params.id)
  
  db.collection("items").findOneAndUpdate(
    { _id: mongo.ObjectID(req.params.id)},
    {
      $set: {
        name: req.body.name,
        department: req.body.department,
        check: false
      },
    },
    {
      sort: { _id: 1 },
      upsert: true,
    },
   
    (err, result) => {
      if (err) return res.send(err);
      res.redirect("/");
    }
  );
});

app.delete("/messages", (req, res) => {
  console.log("deleted");
  db.collection("items").findOneAndDelete(
    { name: req.body.name },
    (err, result) => {
      if (err) return res.send(500, err);
      res.send("Message deleted!");
    }
  );
});

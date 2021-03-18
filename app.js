//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

//Require Mongoose package that have just been installed
const mongoose = require("mongoose");

//Code from before mongoDB creation - also delete the date.js file from the project
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// Previous the data was stored in an array but every new item would be removed when the server restarted
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


//Create a new DB inside mongoDB
//Connect to the URL where mongoDB is hosted locally (usually localhost:27017)
//Call the DB todolistDB
//add useNewUrlParser: true - to avoid the deprecation warning sign
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});







//Create the itemsSchema schema for the mongoDB
const itemsSchema = {
  name: String
};

//Create a new mongoose model (Item) based on the itemsSchema
//The collection will be called items - so we use the singular version of it for creating the model
const Item = mongoose.model("Item", itemsSchema);

//Create 3 new documents using the Item mongoose model
const item1 = new Item({
  name: "Welcome to your to-do-list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

//Add all the new created documents above into an array called
const defaultItems = [item1, item2, item3];



//Create new schema - each new list we create the list will have a name and an array of item documents
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//Create the mongoose model
const List = mongoose.model("List", listSchema);



//Use mongoose's method insertMany to insert all the documents into the items collection
// Item.insertMany(defaultItems, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("All documents inserted to DB using insertMany method!");
//   }
// });




app.get("/", function(req, res) {

  //Check if the items collection is empty, if empty insert defaultItems, otherwise do not insert the defaultItems


  //Call mongoose find method
  //foundItems will contain what has been found inside the Items collections using the find method
  Item.find({}, function(err, foundItems) {
    //Check if the array/collection of items is empty
    if (foundItems.length === 0) {
      // Use mongoose's method insertMany to insert all the documents into the items collection
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("All documents inserted to DB using insertMany method!");
        }
      });

      //Redirect back to the rote route in order to render the new items over to the list.ejs
      res.redirect("/");

    } else {
      //Render the default list with a title called Today
      //Pass the items from the items collection
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });



  //Create express route parameter
  app.get("/:customListName", function(req, res) {

    const customListName = req.params.customListName;

    //Mongoose findOne method - find a list with the same name the user is trying to access
    List.findOne({
      name: customListName
    }, function(err, foundList) {
      if (!err) {
        if (!foundList) {

          //Create a new list
          const list = new List({
            name: customListName,
            items: defaultItems
          });

          //Save the data into the list collection
          list.save();

          //Redirect to the current route
          res.redirect("/" + customListName);
        } else {
          //Show an existing list
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items
          });

          console.log("Exists!");
        }
      }
    });
  });


  //Code from before mongoDB creation - also delete the date.js file from the project
  //const day = date.getDate();

});



app.post("/", function(req, res) {

  const itemName = req.body.newItem;

  //Create a new item document based on the model in mongoDB
  const item = new Item({
    name: itemName
  });

  //mogoose shortcute to save the new item
  item.save();

  //Refresh the page
  res.redirect("/");



  //Previous code
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});









//New route to delete what has been checked in the check box
app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId, function(err) {
    if (!err) {
      console.log("Successfully deleted checked item");

      //Refresh the page to display the changes
      res.redirect("/");
    } else {
      console.log(err);
    }
  });
});









app.get("/about", function(req, res) {
  res.render("about");
});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
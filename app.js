//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { read } = require("fs");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://spenser:RSIA6CZudt7FnpqR@cluster0.0ygbq.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name : "Read for 30 Minutes",
});

const item2 = new Item ({
  name : "Write for 30 Minutes",
});

const item3 = new Item ({
  name : "Draw for 30 Minutes",
});


const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function(err){
//   if (err){
//     console.log(err);
//   } else {
//     console.log("Default items have been inserted into the the Item collection.");
//   }
// });


// Had to delete an blank entry I created. 
// Item.deleteOne({_id:"625e1c6dc646c655f56bd468"}, function(err) {
//       if (err){
//           console.log(err);
//       } else {
//           console.log("Deleted random thing.")
//       }
  
//   });




app.get("/", function(req, res) {

  Item.find({}, function(err, results){

    if (results.length === 0) {

      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Default items have been inserted into the the Item collection.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: results});;
    }
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
 
  const userItem = new Item ({
    name : itemName,
  });

  if (listName === "Today"){
    userItem.save();
    res.redirect("/")
  } else {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(userItem);
      foundList.save();
      res.redirect("/" + listName);
    })

  }

  

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted check item.");
        res.redirect("/");
      }
    })

  } else {
    List.findOneAndUpdate ({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    }

    )
  }




});


app.get("/:custListName", function(req, res){
  const customListName = _.capitalize(req.params.custListName);

  List.findOne({name:customListName}, function (err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list if one of the same name does not exists;
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save()
        res.redirect("/" + customListName)
      } else {
       //Show existing list.
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully.");
});

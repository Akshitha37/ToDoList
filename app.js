//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const url = process.env.MONGODB_URL;

mongoose.connect(url, {useNewUrlParser :true});

const itemsSchema =  {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to your todolist"
});

const item2 = new Item({
  name : "add a new item"
});

const item3 = new Item({
  name : "delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);






app.get("/", function(req, res) {



  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfull")
        }
      });
      res.redirect("/");
    }

    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

});

app.get("/:customListName", function(req,res){
  const ListName = _.capitalize(req.params.customListName);
List.findOne({name: ListName}, function(err, foundList){
  if(!err){
    if(!foundList){
      const list = new List ({
        name: ListName,
        items : defaultItems
      });
      list.save();
      res.redirect("/"+ ListName);
    }
    else{
      res.render("list", {listTitle: foundList.name, newListItems:foundList.items });
    }
  }
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listNa = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listNa === "Today"){
    item.save();
    console.log("added a new item");
    res.redirect("/");
  }
  else{
    List.findOne({name:listNa}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      console.log("added a new item");
      res.redirect("/" + listNa);
    });
  }
});

app.post("/delete", function(req,res){
  const checkedBoxId = req.body.checkbox;
  console.log(checkedBoxId);
  const listNam = req.body.listNam;
  console.log(listNam);

  Item.findByIdAndRemove(checkedBoxId, function(err){

    if(listNam === "Today"){
      Item.findByIdAndRemove(checkedBoxId, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully deleted");
          res.redirect("/");
        }
});
}

else {
    List.findOneAndUpdate({name: listNam}, {$pull: {items: {_id: checkedBoxId}}}, function(err,foundList){
      if(!err){
        console.log("successfully deleted from custom list");
        res.redirect("/"+ listNam);
      }
    });
  }

  });
});






app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started ");
});

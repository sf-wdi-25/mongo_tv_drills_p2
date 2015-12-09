## MongoDB: TV CRUD Drills - Part 2

In this lab we will explore the pros and cons of using "embedded" vs. "referenced" documents in MongoDB Schemas.

Your goal is to design `Show`, `Character`, and `Actor` Schemas that facilitate data retrieval, and a seed task that will allow us to explore our database structure.

## Setting up Mongoose
Add `mongoose` to `package.json`:

``` bash
npm install --save mongoose
```

Next, let's connect to our database in `index.js`:

``` js
// models/index.js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my-tv-db-p2');
```

Finally, let's import our `Character` and `Show` models into `index.js` (we'll do this with ALL of our models so that they're easier to import into e.g. `server.js` or `seed.js`).

``` js
// models/index.js
module.exports.Character = require("./character.js");
module.exports.Show = require("./show.js");
```

#### Node REPL Sanity Check
As a sanity check, let's test everything is working so far by opening the Node REPL:

```bash
node
```

```js
var db = require("./models/index.js");
// or
var db = require("./models");
```

> If there are errors, this is a good moment to debug: is your server running? Are there syntax errors in your code? Is everything being imported/exported correctly?

Your database is empty at the moment, but here's how we might verify that inside the REPL:

```js
db.Character.count({}, function(err, count){
    if (err) {
        console.log(err);
        return;
    }
    console.log("The number of Characters is: ", count);
});
```

#### Seeding the Database
Take a look at `seed.js` and then go ahead and seed the database:

```js
node seed.js
```

## Challenge 1: Characters belong to Shows
One of the odd things about the design of our database so far is that the only relationship between our `characters` and our `shows` is the title of the show. That's pretty fragile! If I ever mistype the title "Game of Thrones" I'll never be able to find anything!

``` js
var seed_characters = [
    {name: "Jon Snow", actor_name: "Kit Harington", show: "Game of Thrones"},
    {name: "Arya Stark", actor_name: "Maisey Williams", show: "Game of Thrones"}
];

var seed_shows = [
    {title: "Game of Thrones", network: "HBO"},
    {title: "True Detective", network: "HBO"}
];
```

And it makes it pretty hard to query the database!

<details>
<summary>**What if I wanted to know what network "Arya Stark" appeared on?** (click here)</summary>

I'd have to make two different queries! (Ouch!)

```js
// first, find the network Arya Stark appeared on
db.Character.findOne({name: "Arya Stark"}, function(err, arya_stark){
    if(err){
        console.log(err)
        return;
    }
    if(!arya_stark){
        console.log("Character Not Found");
        return;
    }

    // Then the show with the corresponding title
    db.Show.findOne({title: arya_stark.show}, function(err, show){
        if(err){
            console.log(err)
            return;
        }
        if(!show){
            console.log("Failed to find network for show:", arya_stark.show);
            return;
        }

        console.log(arya_stark.name, "appeared on", show.network);

    });
})
```
</details>

<details>
<summary>**What if I wanted to know all the characters that appeared on "HBO"?** (click here)</summary>

Ouch! I'd have to find all the shows for a network, and then all the characters for each show! That's a ton of work!

```js
// this is the most efficient way to do it. And it's not pretty!
db.Show.aggregate([
    {
        $group: {
            _id: null,
            show_titles: {
                $push: "$title"
            }
        }
    }
], function(err, results){
    var hbo_show_titles = results[0].show_titles;
    
    db.Character.aggregate([
      {
        $match: {
          show: {
            $in: hbo_show_titles
          }
        }
      },
      {
        $group: {
          _id: null,
          hbo_character_names: {
            $push: "$name"
          }
        }
      }
    ], function(err,results){
     console.log(arguments)
      console.log("HBO characters:", results[0].hbo_character_names.join(", "));
    });

});
```
</details>

There must be a better way!

#### 1.1 Embedded Characters Challenge: Shows have Characters - [solution](https://github.com/sf-wdi-25/mongo_tv_drills_p2/commit/19b918b3719febb4f5f4866e2b2fe1a453c767bb?diff=split)
Life would be a lot easier if _characters_ "lived" inside of _shows_.

For example, the show "Game of Thrones" might look something like this:

```js
var show = {
    _id: "132a2377b43c3212",
    title: "Game of Thrones",
    network: "HBO",
    characters: [
        { name: "Jon Snow", actor_name: "Kit Harington" },
        { name: "Arya Stark", actor_name: "Maisey Williams" }
    ]
}

show.title // "Game of Thrones"
show.network // "HBO"
show.characters // [{...}, {...}]
```

To achieve this goal, we need to embed the `CharacterSchema` inside our `ShowSchema`:

```js
// models/show.js

var ShowSchema = new mongoose.Schema({
  title: String,
  network: String,
  characters: [ CharacterSchema ]
});
```

But wait a second, where's the variable `CharacterSchema` coming from?

Before we can use `CharacterSchema` we need to grab it from `character.js`. Here's one way to do it:

```js
//models/show.js

var CharacterSchema = require("./character.js").schema

// var ShowSchema = new mongoose.Schema({
//   title: String,
//   network: String,
//   characters: [ CharacterSchema ]
// });
```

#### 1.2 Seeding Embedded Data - [solution](https://github.com/sf-wdi-25/mongo_tv_drills_p2/commit/5a90ecc8e17ea8a9f355e20bd3e191c6bbf1ae65?diff=split)
We've made an important change to the structure of our Show Schema. Before we can move on, we need to update our seed task.

Recall that `characters` is an array. In plain old Javascript, if you want to add a value to an array, you use `push`. It turns out we can do the same thing in MongoDB:

```js
// db.Show.findOne({title: "Game of Thrones"}, function(err, GoT){
    GoT.characters.push(arya_stark);
    GoT.characters.push(jon_snow);
    
    // don't forget to save!
    GoT.save(function(err){
        if (err) {
            console.log(err);
            return;
        }
        console.log("Successfully added characters to Game of Thrones")
    });
// })
```

Or, you could just build up one big `show` object and `create` it!

```js
db.Show.create(show_full_of_characters, function(show){
    console.log(show);
})
```

For more hints, see [Working with Mongoose SubDocs](http://mongoosejs.com/docs/subdocs.html).

#### 1.3 Query Challenges
* Query all the shows on "HBO".
* Query all the characters in "True Detective".
* Stretch: Query all the characters on "HBO".

## Challenge 2: Actórs!
We forgot about the actórs! The stars of the show!

#### 2.1 Actór Schema
Let's create a new `Actor` model that returns an object like:

``` js
var actors = [
    {
        _id: "a3a3a3a3a3a", // never assign this _id yourself!
        name: "Matthew McConaughey",
        year_of_birth: 1969,
        hometown: "Uvalde, Texas, USA"
    },
    {
        _id: "b4b4b4b4b4b", // let the database assign the _id for you!
        name: "Maisie Williams",
        year_of_birth: 1997,
        hometown: "Brisol, England, UK"
    }
];
```

Make sure to update your seed task as well!

#### 2.2 Reference Challenge: Characters are played by Actors!
Suppose we wanted to find some information about the actor who plays "Maisie Williams". Right now that data lives in the actors "table", and it isn't connected to characters at all.

Wouldn't it be great if you could do something like:

``` js
character.actor.hometown
```

This assumes that the actor "lives" inside of the character. But Actors can have many roles! If we embed the actor in the character, we'll end up with the actor being repeated over and over and over (and it will be impossible to keep track of all of them, and keep them all up to date!).

We need MongoDB references!

Can you redesign the Charcter schema to reference actors. When you're finished, a character document should look like this:

```js
var character = {
    _id: "111a111a111", // never assign this _id yourself!
    name: "Detective Rust Cohle",
    show: "True Detective",
    actor: "a3a3a3a3a3a"
}
```

A reference is just a MongoDB `_id` plus the model it belongs to. In the schema, that will look like this:

``` js
actor: { type: Schema.Types.ObjectId, ref: 'Actor' }
```

1. How would you modify your seed task to get this working?
2. Can you verify that the `_id` is pointing to the correct actor?
3. Can you use the [mongoose `.populate()`](http://mongoosejs.com/docs/api.html#model_Model.populate) method so that instead of displaying an `_id` for `actor`, it actually displays the actor object there instead!

#### 2.3 Embedded Reference Challenge: Actors have roles!
Shows have characters, but actors do too! They have "roles" or "characters" that they play.

Ideally I'd be able to do something like this:

```js
actor.roles[0]._id // "111a111a111"
show.characters[1].name // "111a111a111"
```

In other words, both the `show` and the `actor` are pointing to the same `character` in the database!

```js
var roles = [
    {_id: "111a111a111", name: "Detective Rust Cohle", show: "True Detective"},
    {_id: "222b222b222", name: "Ron Woodroof", show: "Dallas Buyers Club"}
]

var actor = {
    _id: "a3a3a3a3a3a",
    name: "Matthew McConaughey",
    year_of_birth: 1969,
    hometown: "Uvalde, Texas",
    roles: [
        "111a111a111",
        "222b222b222"
    ]
}
```

Note that `roles` points to an array of `_ids`, specifically *character _ids*. How would you modify your `ActorSchema` to allow for this?

## Recap / Questions
1. Can you draw a picture of the database we've designed. How are our collections/models related (`Actor`, `Character`, `Show`).
2. Is it easy to retrieve information from our database. For example, can I easily grab:
    * all the characters in a show
    * all the roles played by an actor
    * the age of the actor who portrayed a character
    * the network that a character appeared on
    * all the actors in a show
4. Can you describe the difference between an "embedded" and a "referenced" document.
    * Which is faster?
    * Which scales better?
    * What kinds of relationships (one-to-one, one-to-many, many-to-many) do these strategies support?
    * What are the limitations of "embedded" subdocuments.
5. How would you design RESTful routes to access the "resources" we created (`Actor`, `Character`, `Show`). For example, what would the route be to `GET`...
    * All the characters
        - Does it matter if characters are "embedded" vs. "referenced"?
    * All the characters for a show
    * All the characters for an actor
    * The actor who played a character

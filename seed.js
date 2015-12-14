var db = require("./models");

var seed_characters = [
    {name: "Jon Snow", actor_name: "Kit Harington", show: "Game of Thrones"},
    {name: "Arya Stark", actor_name: "Maisie Williams", show: "Game of Thrones"},
    {name: "Detective Rust Cohle", actor_name: "Matthew McConaughey", show: "True Detective"},
    {name: "Detective Marty Hart", actor_name: "Woody Harrelson", show: "True Detective"},
    {name: "Dr. John W. Thackery", actor_name: "Clive Owen", show: "The Knick"}
];

var seed_shows = [
    {title: "Game of Thrones", network: "HBO"},
    {title: "True Detective", network: "HBO"},
    {title: "The Knick", network: "Cinemax"}
];

var seed_actors = [
    { name: "Matthew McConaughey", year_of_birth: 1969, hometown: "Uvalde, Texas, USA" },
    { name: "Maisie Williams", year_of_birth: 1997, hometown: "Brisol, England, UK" }
];


var new_actors = seed_actors.map(function(a){
  return new db.Actor(a);
});

var new_characters = seed_characters.map(function(c){
  var new_char = new db.Character(c);
  new_char.set("actor_name", c.actor_name, {strict: false}); // temporary value
  new_char.set("show_name", c.show, {strict: false}); // temporary value
  return new_char;
});

var new_shows = seed_shows.map(function(s){
  var new_show = new db.Show(s);
  new_characters.forEach(function(new_char){
    if ( new_show.title === new_char.get("show_name") ) {
      new_show.characters.push(new_char);
      new_char.show = new_show;

      var actor = new_actors.filter(function(new_actor){
        return new_actor.name === new_char.get("actor_name");
      })[0];

      if (actor){
        new_char.actor = actor._id;
        actor.roles.push(new_char);
      }
    }

  })
  return new_show;
})

db.Show.remove({}, function(err){
  if (err) { console.log(err); return; }

  db.Character.remove({}, function(err){
    if (err) { console.log(err); return; }

    db.Actor.remove({}, function(err){
      if (err) { console.log(err); return; }

      db.Character.create(new_characters, function(err, characters){
        if (err) { console.log(err); return; }
        console.log("Seeded characters with actors");
      })

      db.Actor.create(new_actors, function(err, actors){
        if (err) { console.log(err); return; }
        console.log("Seeded actors with roles");
      });

      db.Show.create(new_shows, function(err, shows){
        if (err) { console.log(err); return; }
        console.log("Seeded shows with characters");
      });

    });
  });
});

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
  return new db.Character(c);
});

var new_shows = seed_shows.map(function(s){
  var new_show = new db.Show(s);
  new_characters.forEach(function(new_char){
    if ( new_show.title === new_char.show ) {
      new_show.characters.push(new_char);

      new_char.actor = new_actors.filter(function(new_actor){
        return new_actor.name === new_char.actor_name;
      })[0];

      if (new_char.actor){
        new_char.actor.roles.push(new_char);
      }
    }

  })
  return new_show;
})

db.Show.remove({}, function(err){
  if (err) { console.log(err); return; }

  db.Actor.remove({}, function(err){
    if (err) { console.log(err); return; }

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

// new_actors.save(function(err){
// })

// new_shows.save(function(err){
// })


// var new_shows = seed_shows.map(function(s){
//   return new db.Show(s);
// })

// var new_actors = seed_actors.map(function(a){
//   return new db.Actor(a);
// });

// db.Show.remove({}, function(err){
//   if (err) { console.log(err); return; }

//   db.Actor.remove({}, function(err){
//     if (err) { console.log(err); return; }

//     // loop over the new shows
//     new_shows.forEach(function(new_show){
//       // loop over seed_characters
//       seed_characters.forEach(function(character){
//         var new_character = new db.Character(character);
//         if (new_character.show === new_show.title) {
//           // add new actor to character, and new characters (roles) to actor
//           new_actors.forEach(function(new_actor, i){
//             if ( new_actor.name === new_character.actor_name ) {
//               new_character.actor = new_actor;
//               new_actor.roles.push(new_character);
//               console.log(new_actor.name, "roles count:", new_actor.roles.length)
//             }
//           })
//           // add seed_characters to show
//           new_show.characters.push(character);
//         }
//       });

//       // save the new show (with all its characters!)
//       new_show.save(function(err){
//         if (err) { console.log(err); return; }
//         console.log("Seeded", new_show.title, "with characters...")
//         console.log(new_show);
//       });
//     });

//     // save the new actors (with all their characters!)
//     new_actors.forEach(function(new_actor){
//       if (err) { console.log(err); return; }
//       console.log(new_actor.roles);
//       new_actor.save(function(err){
//         if (err) { console.log(err); return; }
//         console.log("Seeded", new_actor.name, "with roles...");
//         console.log(new_actor);
//       });
//     });

//   });
// });


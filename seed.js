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


db.Show.remove({}, function(err){
  if (err) { console.log(err); return; }
  db.Show.create(seed_shows, function(err, shows){
    if (err) { console.log(err); return; }

    // loop over the new shows
    shows.forEach(function(show){
      // seed the characters
      seed_characters.forEach(function(character){
        if (character.show === show.title) {
          show.characters.push(character);
        }
      });

      // save the show (and all the characters in the show!)
      show.save(function(err){
        if (err) { console.log(err); return; }
        console.log("Seeded", show.title, "with characters...")
        console.log(show);
      });
    });
  });
});


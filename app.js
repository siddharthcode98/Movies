const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB ERROR ${e.messsage}`);
  }
};
initialiseDBAndServer();
//movies
let convertDBObjectToResponseDb = (eachMovie) => {
  return {
    movieId: eachMovie.movie_id,
    directorId: eachMovie.director_id,
    movieName: eachMovie.movie_name,
    leadActor: eachMovie.lead_actor,
  };
};
//directors
let convertDBObjectToResponseDb2 = (eachMovie) => {
  return {
    directorId: eachMovie.director_id,
    directorName: eachMovie.director_name,
  };
};

//API 1:Returns a list of all movie names in the movie table
app.get("/movies/", async (request, response) => {
  const getAllMoviesList = `SELECT movie_name FROM movie;`;
  const movieList = await db.all(getAllMoviesList);
  response.send(
    movieList.map((eachMovie) => {
      return convertDBObjectToResponseDb(eachMovie);
    })
  );
});
//API 2: Creates a new movie in the movie table. movie_id is auto-incremented

app.post("/movies/", async (request, response) => {
  const movieList = request.body;
  const { directorId, movieName, leadActor } = movieList;
  const createANewMovie = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES
    (
       ${directorId},
       '${movieName}',
       '${leadActor}' 
    );`;
  await db.run(createANewMovie);
  response.send("Movie Successfully Added");
});

// API 3 Returns a movie based on the movie ID

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `SELECT * FROM movie WHERE movie_id= ${movieId};`;
  //   console.log(getMovie);
  const movie = await db.get(getMovie);
  //   console.log(movie);
  response.send(convertDBObjectToResponseDb(movie));
});

// API 4:Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie
    SET
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE 
    movie_id=${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5 :Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6: Returns a list of all directors in the director table
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director;`;
  const directorList = await db.all(getDirectorQuery);
  response.send(
    directorList.map((eachDirector) => {
      return convertDBObjectToResponseDb2(eachDirector);
    })
  );
});
// API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  //   console.log(directorId);
  const getAllMoviesList = `SELECT movie_name FROM movie WHERE director_id= ${directorId};`;
  const movieList = await db.all(getAllMoviesList);
  response.send(
    movieList.map((eachMovie) => {
      return convertDBObjectToResponseDb(eachMovie);
    })
  );
});

module.exports = app;

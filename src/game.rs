use tokio::net::TcpStream;
use serde::Deserialize;
use serde::Serialize;
use serde_json::{self, json};
use uuid::Uuid;

// This is propably a bad way of storing players streams 

#[derive(Debug)]
pub struct Player {
  name: Option<String>,
  stream: Option<TcpStream>  
}

#[derive(Debug, Deserialize)]
pub struct NewGame {
  pub name: String,
  player_one: String,
}

#[derive(Debug)]
pub struct Game {
  pub id: String,
  pub name: String,
  player_one: Player,
  player_two: Player,
}

#[derive(Debug, Serialize)]
pub struct GameResponse {
  pub id: String,
  pub name: String,
}

#[derive(Debug)]
pub struct Games {
  running: Vec<Game>
}

impl Games {
  pub fn new() -> Games {
    return Games{running: Vec::new()}
  }

  fn find(&mut self, id: String) -> &mut Game {
    let game = &mut self.running.iter().position(|g| g.id == id);

    return &mut self.running[game.unwrap()];
  }

  pub fn create(&mut self, new_game: NewGame) -> &Game {
    let id = Uuid::new_v4().to_string();
    let player = Player{
      name: Some(new_game.player_one),
      stream: None,
    }; 
    let game = Game{
      id,
      name: new_game.name,
      player_one: player,
      player_two: Player{name: None, stream: None}
    };

    self.running.push(game);

    let created_game = match self.running.last() {
      Some(v) => v,
      None => panic!("well we fucked up")
    };

    return created_game;
  }
} 

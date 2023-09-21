use tokio::net::TcpStream;
use serde::Deserialize;
use serde_json::{self, json};
use uuid::Uuid;

// This is propably a bad way of storing players streams 

#[derive(Debug)]
pub struct Player {
  name: Option<String>,
  stream: Option<TcpStream>  
}

#[derive(Deserialize, Debug)]
pub struct NewPlayer {
  name: String,
}

#[derive(Debug)]
pub struct Game {
  id: String,
  player_one: Player,
  player_two: Player,
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

  pub fn create(&mut self, new_player: NewPlayer) {
    let id = Uuid::new_v4().to_string();
    let player = Player{
      name: Some(new_player.name),
      stream: None,
    }; 
    let game = Game{
      id,
      player_one: player,
      player_two: Player{name: None, stream: None}
    };

    self.running.push(game);
  }
} 

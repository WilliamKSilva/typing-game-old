use tokio::net::TcpStream;
use serde::Deserialize;
use serde_json::{self, json};

// This is propably a bad way of storing players streams 
pub struct Player {
    name: String,
    stream: TcpStream
}

#[derive(Deserialize, Debug)]
pub struct NewPlayer {
    name: String,
    game_id: String,
}

pub struct Game {
    id: String,
    player_one: Player,
    player_two: Player,
}

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

    fn create(&mut self, new_player: NewPlayer) {
    } 
} 

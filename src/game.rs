use serde::Deserialize;
use serde::Serialize;
use serde_json::{self, json};
use tokio::net::TcpStream;
use uuid::Uuid;

use crate::http::build_bad_response;
use crate::http::build_success_response;
use crate::http::close_stream;

// This is propably a bad way of storing players streams

#[derive(Debug)]
pub struct Player {
  name: Option<String>,
  buff: Option<String>
}

#[derive(Debug, Deserialize)]
pub struct NewGame {
    pub name: String,
    player_one: String,
}

#[derive(Debug, Deserialize)]
pub struct EnterGame {
    id: String,
    player: String,
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
    running: Vec<Game>,
}

impl Games {
    pub const fn new() -> Games {
        return Games {
            running: Vec::new(),
        };
    }

    fn find(&mut self, id: String) -> &mut Game {
        let game = self.running.iter_mut().find(|g| g.id == id).unwrap();

        return game;
    }

    pub fn create(&mut self, new_game: NewGame) -> &Game {
        let id = Uuid::new_v4().to_string();
        let player = Player {
            name: None,
            buff: None,
        };
        let game = Game {
            id,
            name: new_game.name,
            player_one: player,
            player_two: Player {
                name: None,
                buff: None,
            },
        };

        self.running.push(game);

        let created_game = match self.running.last() {
            Some(v) => v,
            None => panic!("well we fucked up"),
        };

        return created_game;
    }

    pub async fn join(
        &mut self,
        data: EnterGame,
        stream: &'static mut TcpStream,
    ) -> (Option<&Game>, Option<&mut TcpStream>) {
        let game: &mut Game = match self.running.iter_mut().find(|g| g.id == data.id) {
            Some(v) => v,
            None => {
                return (None, Some(stream));
            }
        };

        match &game.player_one.name {
            Some(v) => {
                game.player_two.name = Some(data.player);
                game.player_two.buff= None;

                return (Some(game), None);
            }
            None => {
                game.player_one.name = Some(data.player);
                game.player_one.buff = None; 

                return (Some(game), None);
            }
        }
    }
}

use serde::Deserialize;
use serde::Serialize;
use tokio::net::TcpStream;
use uuid::Uuid;

// This is propably a bad way of storing players streams

#[derive(Debug)]
pub struct Player {
    pub name: Option<String>,
    pub buff: Option<String>,
    pub stream: Option<TcpStream>,
}

#[derive(Debug, Deserialize)]
pub struct NewGame {
    pub name: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct EnterGame {
    pub id: String,
    pub player: String,
}

#[derive(Debug)]
pub struct Game {
    pub id: String,
    pub name: String,
    pub player_one: Player,
    pub player_two: Player,
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

impl Game {
    pub fn find_player_and_opponent(&mut self, name: String) -> (Option<&mut TcpStream>, Option<&mut TcpStream>) {
        if self.player_one.name.clone().unwrap() == name {
            return (self.player_one.stream.as_mut(), self.player_two.stream.as_mut());
        } else {
            return (self.player_two.stream.as_mut(), self.player_one.stream.as_mut());
        }
    }
}

impl Games {
    pub const fn new() -> Games {
        return Games {
            running: Vec::new(),
        };
    }

    pub fn find(&mut self, id: String) -> &mut Game {
        let game = self.running.iter_mut().find(|g| g.id == id).unwrap();

        return game;
    }

    pub fn create(&mut self, new_game: NewGame) -> &Game {
        let id = Uuid::new_v4().to_string();
        let player = Player {
            name: None,
            buff: None,
            stream: None,
        };
        let game = Game {
            id,
            name: new_game.name,
            player_one: player,
            player_two: Player {
                name: None,
                buff: None,
                stream: None,
            },
        };

        self.running.push(game);

        let created_game = match self.running.last() {
            Some(v) => v,
            None => panic!("well we fucked up"),
        };

        return created_game;
    }

    pub fn join(&mut self, data: EnterGame, stream: TcpStream) -> Option<&mut Game> {
        let game: &mut Game = match self.running.iter_mut().find(|g| g.id == data.id) {
            Some(v) => v,
            None => return None,
        };

        match &game.player_one.name {
            Some(v) => {
                game.player_two.name = Some(data.player);
                game.player_two.buff = None;
                game.player_two.stream = Some(stream);

                return Some(game);
            }
            None => {
                game.player_one.name = Some(data.player);
                game.player_one.buff = None;
                game.player_one.stream = Some(stream);

                return Some(game);
            }
        }
    }
}

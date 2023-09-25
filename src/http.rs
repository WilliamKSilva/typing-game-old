use std::sync::{Arc, Mutex};

use serde::de::DeserializeOwned;
use serde::ser::Serialize;
use serde::Deserialize;
use serde_json::{self, json};
use tokio::io::AsyncReadExt;
use tokio::{io::AsyncWriteExt, net::TcpStream};

use crate::game;
use crate::http;

enum Path {
    NewGame,
    JoinGame,
}

// Just pass everything on body of the request
// No query params please
impl Path {
    pub fn as_str(&self) -> &'static str {
        match self {
            Path::NewGame => "/game/new",
            Path::JoinGame => "/game/join",
        }
    }
}

#[derive(Deserialize, Debug)]
pub struct Message {
    room: String,
    name: String,
}

pub struct HttpRequest {
    pub body: String,
    pub method: String,
    pub path: String,
}

pub async fn http_request(stream: &mut TcpStream) -> Option<HttpRequest> {
    let mut headers = [httparse::EMPTY_HEADER; 64];
    let mut req = httparse::Request::new(&mut headers);

    let _ = stream.readable().await;
    let mut buff_reader = vec![0; 1024];

    stream.try_read(&mut buff_reader).unwrap();

    let mut body = String::new();
    get_body(String::from_utf8(buff_reader.clone()).unwrap(), &mut body);

    match req.parse(&buff_reader) {
        Ok(bytes) => (),
        Err(_) => return None,
    };

    let method = req.method.clone().unwrap();

    if method.is_empty() {
        return None;
    }

    let path = req.path.clone().unwrap();

    if path.is_empty() {
        return None;
    }

    return Some(HttpRequest {
        body,
        method: method.to_string().clone(),
        path: path.to_string().clone(),
    });
}

// Fuck it, I need the JSON body, but the httparse crate don't give any method to get this!
// This is a dumb approach I'am certain of that, I will find something better
fn get_body(buff: String, body: &mut String) {
    let mut json_start = false;
    for c in buff.chars() {
        if c == '}' {
            body.push(c);
            break;
        }

        if c == '{' {
            json_start = true;
            body.push(c);
            continue;
        }

        if json_start {
            body.push(c);
            continue;
        }
    }
}

pub fn build_success_response() -> String {
    let status = "HTTP/1.1 200 OK\r\n\r\n";
    // let contents = match data {
    //     Some(v) => serde_json::to_string(&v).unwrap(),
    //     None => json!({
    //         "message": "ok"
    //     })
    //     .to_string(),
    // };

    let contents = json!({
            "message": "ok"
        });

    let response = format!("{status}\r\n{contents}");

    return response;
}

pub fn build_bad_response() -> String {
    let status = "HTTP/1.1 400 Bad Request\r\n\r\n";
    let contents = json!({
        "message": "Bad Request",
    });

    let response = format!("{status}\r\n{contents}");

    return response;
}

pub async fn close_stream(response: String, stream: &mut TcpStream) {
    let _ = stream.write_all(response.as_bytes()).await.unwrap();
}

fn parse_json<T: DeserializeOwned>(buff: String) -> Option<T> {
    let data: Option<T> = match serde_json::from_str(&buff) {
        Ok(v) => Some(v),
        Err(_) => None,
    };

    return data;
}

// Fancy web framework routers?? No!! We right like the ancient people
pub async fn router(
    path: String,
    games_mutex: Arc<Mutex<game::Games>>,
    req: &http::HttpRequest,
    mut stream: TcpStream,
) {
    let new_game_path = Path::NewGame.as_str();
    let enter_game_path = Path::JoinGame.as_str();
    match path {
        new_game_path => {
            let new_game: game::NewGame = match parse_json::<game::NewGame>(req.body.clone()) {
                Some(value) => value,
                None => return close_stream(build_bad_response(), &mut stream).await,
            };

            {
                let mut games = games_mutex.lock().unwrap();
                let created = games.create(new_game);
            }

            return close_stream(build_success_response(), &mut stream).await;
        }
        enter_game_path => {
            let enter_game: game::EnterGame = match parse_json::<game::EnterGame>(req.body.clone())
            {
                Some(v) => v,
                None => return close_stream(build_bad_response(), &mut stream).await,
            };

            let id = enter_game.id.clone();
            let name = enter_game.player.clone();

            let mut games = games_mutex.lock().unwrap();

            let _ = games.join(enter_game, stream);

            loop {
                let mut buff_reader = vec![0; 1024];

                let game = games.find(id.clone());

                let (player, opponent) = game.find_player_and_opponent(name.clone());

                // I don't have a clue how to deal with errors in this scenario
                let player_stream = match player {
                    Some(v) => v,
                    None => return,
                };

                let opponent_stream = match opponent {
                    Some(v) => v,
                    None => {
                        print!("No opponent yet");
                        continue;
                    }
                };

                match player_stream.read(&mut buff_reader).await {
                    Ok(0) => return,
                    Ok(n) => {
                        let teste = "aijksudah";
                        let _ = opponent_stream.try_write(teste.as_bytes());
                    }
                    Err(_) => {
                        return;
                    }
                }
            }
        }
    }
}

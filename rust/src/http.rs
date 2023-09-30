use std::error::Error;
use std::fmt::{self, Debug};
use std::sync::Arc;

use serde::de::DeserializeOwned;
use serde::ser::Serialize;
use serde_json::{self, json};
use std::sync::Mutex;
use tokio::{io::AsyncWriteExt, net::TcpStream};

use crate::game::{self, GameResponse};
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

pub struct HttpRequest {
    pub body: String,
    pub method: String,
    pub path: String,
}

#[derive(Debug)]
pub struct GenericError(String);

impl fmt::Display for GenericError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "There is an error: {}", self.0)
    }
}

impl Error for GenericError {}

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

pub fn build_success_response<T: Serialize>(data: Option<T>) -> String {
    let status = "HTTP/1.1 200 OK\r\n\r\n";
    let contents = match data {
        Some(v) => serde_json::to_string(&v).unwrap(),
        None => json!({
            "message": "ok"
        })
        .to_string(),
    };

    let response = format!("{status}\r\n{contents}");

    return response;
}

pub fn build_bad_response(error: Option<String>) -> String {
    let status = "HTTP/1.1 400 Bad Request\r\n\r\n";
    let contents = json!({
        "message": format!("{}", error.unwrap()),
    });

    let response = format!("{status}\r\n{contents}");

    return response;
}

pub async fn write(response: String, stream: &mut TcpStream) {
    let _ = stream.write_all(response.as_bytes()).await.unwrap();
}

// fn parse_json<T>(buff: String) -> Result<T, Box<dyn std::error::Error + Send + Sync>>

fn parse_json<T>(buff: String) -> Result<T, String>
where
    T: DeserializeOwned,
    T: Debug,
{
    let data: T = match serde_json::from_str(&buff) {
        Ok(v) => v,
        Err(e) => return Err(e.to_string()),
    };

    return Ok(data);
}

// Fancy web framework routers?? No!! We right like the ancient people
pub async fn router(
    path: String,
    games_mutex: Arc<Mutex<game::Games>>,
    req: &http::HttpRequest,
    mut stream: TcpStream,
) {
    // TODO alterar toda a logica de jogo pra usar channels
    // Entender melhor como armazenar esses channels do Tokio
    match path.as_str() {
        "/game/new" => {
            let mut games = games_mutex.lock().unwrap();

            let new_game: game::NewGame = match parse_json::<game::NewGame>(req.body.clone()) {
                Ok(value) => value,
                Err(e) => {
                    let response = build_bad_response(Some(e));
                    return write(response, &mut stream).await;
                }
            };

            let created = games.create(new_game);
            let game_response = game::GameResponse {
                id: created.id.clone(),
                name: created.name.clone(),
            };

            return write(build_success_response(Some(game_response)), &mut stream).await;
        }
        "/game/join" => {
            let mut games = games_mutex.lock().unwrap();

            let enter_game: game::EnterGame = match parse_json::<game::EnterGame>(req.body.clone())
            {
                Ok(v) => v,
                Err(e) => return write(build_bad_response(Some(e)), &mut stream).await,
            };

            let id = enter_game.id.clone();
            let name = enter_game.player.clone();

            games.join(enter_game, stream).unwrap();
        }
        _ => {
            return write(
                build_bad_response(Some(String::from("Not found"))),
                &mut stream,
            )
            .await;
        }
    }
}
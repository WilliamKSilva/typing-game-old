use std::sync::{Mutex, Arc};

use serde::de::DeserializeOwned;
use serde::Deserialize;
use serde_json::{self, json};
use tokio::net::TcpSocket;
use tokio::{io::AsyncWriteExt, net::TcpStream};

use crate::game;
use crate::http;

enum Path {
    Game,
}

impl Path {
    pub fn as_str(&self) -> &'static str {
        match self {
            Path::Game => "/game",
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
    let contents = json!({
        "message": "Ok",
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

fn parse_json<T: DeserializeOwned>(buff: String) -> T {
    let data: T = serde_json::from_str(&buff).unwrap();

    return data;
}

// Fancy web framework routers?? No!! We right like the ancient people
pub fn router(path: String, games: Arc<Mutex<game::Games>>, req: &http::HttpRequest) -> String {
    let game = Path::Game.as_str();
    let mut games = games.lock().unwrap();
    match path {
        game => {
            let new_player: Option<game::NewPlayer> = match serde_json::from_str(&req.body.clone()) {
                Ok(v) => Some(v),
                Err(_) => None,
            };

            match new_player {
                Some(v) => {
                    let created = games.create(v);
                    println!("{:?}", games);

                    return build_success_response();
                },
                None => return build_bad_response()
            }
        }
    }
}

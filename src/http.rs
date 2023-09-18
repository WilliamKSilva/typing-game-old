use serde::de::DeserializeOwned;
use tokio::{net::TcpStream, io::AsyncWriteExt};
use serde::Deserialize;
use serde_json::{self, json};

#[derive(Deserialize, Debug)]
pub struct Message {
    room: String,
    name: String,
}

pub struct HttpRequest {
    body: String,
    method: String,
    path: String,
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
        Err(_) => {
            return None
        } 
    };

    let method = req.method.clone().unwrap();

    if method.is_empty() {
        return None;
    }

    let path = req.path.clone().unwrap();

    if path.is_empty() {
        return None;
    }

    return Some(HttpRequest { body, method: method.to_string(), path: path.to_string()  }) 
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

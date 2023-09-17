use serde::de::DeserializeOwned;
use tokio::{net::TcpStream, io::AsyncWriteExt};
use serde::Deserialize;
use serde_json::{self, json};

#[derive(Deserialize, Debug)]
struct Message {
    room: String,
    name: String,
}

pub async fn http_request(mut stream: TcpStream) {
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
            return close_stream(build_bad_response(), &mut stream).await
        } 
    };

    close_stream(build_success_response(), &mut stream).await
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

fn build_success_response() -> String {
    let status = "HTTP/1.1 200 OK\r\n\r\n";
    let contents = json!({
        "message": "Ok",
    }); 

    let response = format!("{status}\r\n{contents}");

    return response;
}

fn build_bad_response() -> String {
    let status = "HTTP/1.1 400 Bad Request\r\n\r\n";
    let contents = json!({
        "message": "Bad Request",
    }); 

    let response = format!("{status}\r\n{contents}");

    return response;
}

async fn close_stream(response: String, stream: &mut TcpStream) {
    let _ = stream.write_all(response.as_bytes()).await.unwrap();
}

fn parse_json<T: DeserializeOwned>(buff: String) -> T {
    let data: T = serde_json::from_str(&buff).unwrap();

    return data;
}

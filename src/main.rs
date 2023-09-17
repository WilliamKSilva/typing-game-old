use serde::Deserialize;
use serde_json;
use tokio::net::{TcpListener, TcpStream};
use tokio::io::{AsyncWriteExt};
use std::error::Error;
use httparse;

#[derive(Deserialize, Debug)]
struct Message {
    room: String,
    name: String,
}

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:3333").await.unwrap();

    println!("Listening on port: 3333");

    loop {
        let (tcp_stream, _) = match listener.accept().await {
            Ok(data) => data,
            Err(_) => panic!("aaaaaaaaaaa")
        }; 

        process_http(tcp_stream).await;
    }
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

async fn process_http(stream: TcpStream) {
    let mut headers = [httparse::EMPTY_HEADER; 64];
    let mut req = httparse::Request::new(&mut headers);

    let _ = stream.readable().await;
    let mut buff_reader = vec![0; 1024];

    stream.try_read(&mut buff_reader).unwrap();

    let mut body = String::new();
    get_body(String::from_utf8(buff_reader.clone()).unwrap(), &mut body);

    println!("{:?}", body);
    
    // assert!(req.parse(&buff_reader).unwrap().is_complete());

    let response = format!("asiudhiasuhdiuashdua");

    // let _ = stream.write_all(response.as_bytes()).await.unwrap();
}

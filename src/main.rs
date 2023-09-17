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

fn read_message_from_stream(buff: String) -> Result<(Message), Box<dyn Error>> {
    let message: Message = serde_json::from_str(&buff).unwrap();
}

async fn process_http(stream: TcpStream) {
    let mut headers = [httparse::EMPTY_HEADER; 64];
    let mut req = httparse::Request::new(&mut headers);

    let _ = stream.readable().await;
    let mut buff_reader = vec![0; 1024];

    stream.try_read(&mut buff_reader).unwrap();

    println!("{:?}", String::from_utf8(buff_reader.clone()));
    
    assert!(req.parse(&buff_reader).unwrap().is_complete());

    let response = format!("asiudhiasuhdiuashdua");

    let (mut std_stream, message) = read_message_from_stream(buff_reader).unwrap();
    print!("{:?}", message.name);
    let _ = std_stream.write_all(response.as_bytes()).unwrap();
}

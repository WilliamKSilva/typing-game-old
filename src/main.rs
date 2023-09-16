use tokio::net::{TcpListener, TcpStream};
use std::io;

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:3333").await.unwrap();

    println!("Listening on port: 3333");

    loop {
        let (tcp_stream, _) = match listener.accept().await {
            Ok(data) => data,
            Err(_) => panic!("aaaaaaaaaaa")
        }; 

        process(tcp_stream).await;
    }
}

async fn process(stream: TcpStream) {
    let mut buff: Vec<u8> = vec![0; 1024];
    let _ = stream.readable().await;
    
    match stream.try_read(&mut buff) {
        Ok(_n) => println!("fuck yeah"),
        Err(_) => panic!("fuck")
    };

    println!("{:?}", buff);

    let data = String::from_utf8(buff);

    println!("{:?}", data);
}

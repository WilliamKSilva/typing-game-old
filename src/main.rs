use tokio::net::{TcpListener, TcpStream};
use tokio::io::{AsyncWriteExt};

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

async fn process(mut stream: TcpStream) {
    let _ = stream.readable().await;
    let mut buff_reader = vec![0; 1024];

    stream.try_read(&mut buff_reader).unwrap();
    
    let data = String::from_utf8(buff_reader).unwrap(); 

    println!("{:?}", data);

    let response = format!("asiudhiasuhdiuashdua");

    let _ = stream.write_all(response.as_bytes()).await.unwrap();
}

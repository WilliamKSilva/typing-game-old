use tokio::net::TcpListener;

mod http;

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:3333").await.unwrap();

    println!("Listening on port: 3333");

    loop {
        let (tcp_stream, _) = match listener.accept().await {
            Ok(data) => data,
            Err(_) => panic!("aaaaaaaaaaa")
        }; 

        http::http_request(tcp_stream).await;
    }
}

use tokio::net::TcpListener;

mod http;
mod game;

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:3333").await.unwrap();

    println!("Listening on port: 3333");

    loop {
        let (mut tcp_stream, _) = match listener.accept().await {
            Ok(data) => data,
            Err(_) => panic!("aaaaaaaaaaa")
        }; 

        let request = match http::http_request(&mut tcp_stream).await {
            Some(req) => req,
            None => return http::close_stream(http::build_bad_response(), &mut tcp_stream).await
        };
    }
}

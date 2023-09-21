use std::sync::{Arc, Mutex};

use tokio::net::TcpListener;

mod game;
mod http;

#[tokio::main]
async fn main() {
	let listener = TcpListener::bind("127.0.0.1:3333").await.unwrap();
	let games = Arc::new(Mutex::new(game::Games::new()));

	println!("Listening on port: 3333");

	loop {
		let data = Arc::clone(&games);
		let (mut tcp_stream, _) = match listener.accept().await {
			Ok(data) => data,
			Err(_) => panic!("aaaaaaaaaaa"),
		};

		tokio::spawn(async move {
			let request = match http::http_request(&mut tcp_stream).await {
				Some(req) => req,
				None => {
					return http::close_stream(http::build_bad_response(), &mut tcp_stream).await
				}
			};

			let response = http::router(request.path.clone(), data, &request);

			http::close_stream(response, &mut tcp_stream).await;
		});
	}
}

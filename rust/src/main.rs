use std::sync::Arc;

use std::sync::Mutex;

use tokio::net::TcpListener;

mod game;
mod http;

#[tokio::main]
async fn main() {
	let listener = TcpListener::bind("127.0.0.1:3333").await.unwrap();
	println!("Listening on port: 3333");

	let games = Arc::new(Mutex::new(game::Games::new()));

	loop {
		let games_clone = games.clone();
		let (mut tcp_stream, _) = match listener.accept().await {
			Ok(data) => data,
			Err(_) => panic!("aaaaaaaaaaa"),
		};

		let _ = tokio::spawn(async move {
			let request = match http::http_request(&mut tcp_stream).await {
				Some(req) => req,
				None => {
					return http::write(http::build_bad_response(None), &mut tcp_stream).await
				}
			};

			http::router(request.path.clone(), games_clone, &request, tcp_stream).await;
		}).await;
	}
}

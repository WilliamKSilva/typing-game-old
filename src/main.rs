use std::sync::{Mutex};

use tokio::net::TcpListener;

mod game;
mod http;

static GAMES: Mutex<game::Games> = Mutex::new(game::Games::new());

#[tokio::main]
async fn main() {
	let listener = TcpListener::bind("127.0.0.1:3333").await.unwrap();
	println!("Listening on port: 3333");

	loop {
		let (mut tcp_stream, _) = match listener.accept().await {
			Ok(data) => data,
			Err(_) => panic!("aaaaaaaaaaa"),
		};

		let join_handle = tokio::spawn(async move {
			let request = match http::http_request(&mut tcp_stream).await {
				Some(req) => req,
				None => {
					return http::close_stream(http::build_bad_response(), &mut tcp_stream).await
				}
			};

			let mut games = GAMES.lock().unwrap();

			http::router(request.path.clone(), &mut games, &request, tcp_stream);
		});

		join_handle.await.unwrap();
	}
}

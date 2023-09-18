use tokio::net::TcpStream;

// This is propably a bad way of storing players streams 
pub struct Player {
    name: String,
    stream: TcpStream
}

pub struct Game {
    id: String,
    player_one: Player,
    player_two: Player,
}

impl Game {
    fn find(&self, id: String) {
    }
}

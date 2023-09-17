use serde::de::DeserializeOwned;
use tokio::net::TcpStream;
use serde::Deserialize;
use serde_json;

#[derive(Deserialize, Debug)]
struct Message {
    room: String,
    name: String,
}

pub async fn http_request(stream: TcpStream) {
    let mut headers = [httparse::EMPTY_HEADER; 64];
    let mut req = httparse::Request::new(&mut headers);

    let _ = stream.readable().await;
    let mut buff_reader = vec![0; 1024];

    stream.try_read(&mut buff_reader).unwrap();

    let mut body = String::new();
    get_body(String::from_utf8(buff_reader.clone()).unwrap(), &mut body);

    println!("{:?}", body);

    let message: Message = parse_json(body);

    println!("{:?}", message.name);
    
    // assert!(req.parse(&buff_reader).unwrap().is_complete());

    // let response = format!("asiudhiasuhdiuashdua");

    // let _ = stream.write_all(response.as_bytes()).await.unwrap();
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

fn parse_json<T: DeserializeOwned>(buff: String) -> T {
    let data: T = serde_json::from_str(&buff).unwrap();

    return data;
}

import http from "node:http"

export const main = () => {
	const server = http.createServer()

	const port = 3333

	server.listen(port, () => {
		console.log(`Server listening on port: ${port}`)
	})

	server.on('request', (req, res) => {
		let buff = ''
		req.on('data', (chunk) => {
			buff += chunk
		})
		req.on('end', () => {
			console.log(buff)
		})

		res.write("200 OK")
		res.end()
	})
}

main()

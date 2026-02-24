"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const server = (0, http_1.createServer)((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.url === "/") {
        res.writeHead(200);
        res.end(JSON.stringify({ message: "Hello Niggas" }));
    }
});
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
//# sourceMappingURL=index.js.map
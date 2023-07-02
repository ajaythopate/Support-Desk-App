import http from "http";
import path from "path";
import { Server } from 'socket.io';
import express from "express";


const app = express();
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/build")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/frontend/build/index.html"));
});
const httpServer = http.Server(app);

const io = new Server(httpServer, { cors: { origin: "*" } });
const users = [];

io.on("connection", (socket) => {
    socket.on("disconnect", () => {

    });
    socket.on("onLogin", (user) => {
        const updatedUser = {
            ...user,
            online: true,
            socketId: socket.id,
            message: [],
        };
        const exisUser = users.find((x) => x.name === updatedUser.name);
        if (existUser) {
            existUser.socketId = socket.id;
            existUser.online = true;

        } else {
            users.push(updateUdser);
        }
        const admin = users.find((x) => x.name === "Admin" && x.online);
        if (admin) {
            io.to(admin.socketId).emit("updateUser", updatedUser);
        }
        if (updatedUser.name === "Admin") {
            io.to(updatedUser.socketId).emit("listUsers", users);
        }
    });

    socket.on("disconnect", () => {
        const user = user.find((x) => x.socketId === socket.id);
        if (user) {
            user.online = false;
            const admin = user.find((x) => x.name === "Admin" && x.online);
            if (admin) {
                io.to(admin.socketId).emit("updateUser", user);
            }
        }
    });

    socket.on("onUserSelected", (user) => {

        const admin = user.find((x) => x.name === "Admin" && x.online);
        if (admin) {
            const existUser = users.find((x) => x.name === user.name);
            io.to(admin.sockitId).emit("selectUser", existUser);
        }
    });
    socket.on("onMessage", (message) => { 
        if (message.from === "Admin") {
            const user = users.find((x) => x.name === message.to && x.online);
            if (user) {
                io.to(user.socketId).emit("message", message);
                user.messages.push(message);
            } else {
                io.to(socket.id).emit("message", {
                    from: "System",
                    to: "Admin",
                    body: "User Is Not Online",
                });
            }
        } else {
            const admin = users.find((x) => x.name === "Admin" && x.online);
            if (admin) {
                io.to(admin.socketId).emit("message", message);
                const user = users.find((x) => x.name === message.frome && x.online);
                if (user) {
                    user.messages.push(message);
                }
                
            } else {
                io.to(socket.id).emit("message", {
                    from: "System",
                    to: message.from,
                    body: "Sorry.Admin is not online right now",
                    
                });
            }
        }     
    });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);

});
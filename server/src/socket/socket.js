import {Server} from 'socket.io';

let io;

const initSocket = (server) => {
  io = new Server(server,{
    cors:{
      origin : "*"
    }
  });
  io.on('connection', (socket) => {
    console.log('User connected',socket.id);
    socket.on('workerLocation',(data)=>{
      io.emit('updateWorkerLocation',data);
    });
    socket.on('disconnect',()=>{
      console.log('User disconnected');
    });
  });
};

const getIo = () => io;
export {initSocket,getIo};
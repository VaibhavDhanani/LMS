export function handleCleanup({io, socket, rooms, mediasoupTransports, consumersMap }) {
  console.log(`Cleaning up after disconnect: ${socket.id}`);

  for (const [roomId, room] of rooms.entries()) {
    // Remove any producers from this socket
    const producersToRemove = [...room.producers].filter(p => p.socketId === socket.id);
    for (const producer of producersToRemove) {
      room.producers.delete(producer);
      // socket.to(roomId).emit('producerClosed', { producerId: producer.id });
      console.log(`Removed producer ${producer.id} from room ${roomId}`);
    }

    // Check if host disconnected
    if (room.host === socket.id) {
      room.host = null;
      // io.to(roomId).emit('lectureEnded', { message: 'Host has left the lecture.' });
    }

    // Remove from consumer map only if present
    if (room.consumers && room.consumers.has(socket.id)) {
      room.consumers.delete(socket.id);
      console.log(`Removed consumer ${socket.id} from room ${roomId}`);

      // io.to(roomId).emit('userLeft', { user: leftUser });

      // Notify all participants of the updated list
      io.to(roomId).emit('updateParticipantList', {
        participants: [...room.consumers.values()],
      });
    }


    // Cleanup room if needed
    if (
      room.producers.size === 0 &&
      room.consumers.size === 0 &&
      room.host === null
    ) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
  }

  // Clean up transports
  for (const [transportId, transport] of mediasoupTransports.entries()) {
    if (transport._data?.socketId === socket.id) {
      transport.close();
      mediasoupTransports.delete(transportId);
      console.log(`Transport ${transportId} closed`);
    }
  }

  consumersMap.delete(socket.id);
}

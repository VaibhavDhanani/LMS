export async function handleProduce({ io, socket, rooms, mediasoupTransports }) {
  socket.on('produce', async ({ transportId, kind, rtpParameters, roomId }, callback) => {
    try {
      if (!rooms.has(roomId)) return callback({ error: 'Room does not exist' });

      const transport = mediasoupTransports.get(transportId);
      if (!transport) throw new Error('Transport not found');

      const producer = await transport.produce({ kind, rtpParameters });

      const producerInfo = {
        id: producer.id,
        kind: producer.kind,
        rtpParameters: producer.rtpParameters,
        socketId: socket.id,
      };

      rooms.get(roomId).producers.add(producerInfo);

      io.to(roomId).emit('newProducer', { producerInfo });

      producer.on('close', () => {
        rooms.get(roomId).producers.delete(producerInfo);
        io.to(roomId).emit('producerClosed', { producerId: producer.id });
      });

      callback({ producerId: producer.id });
    } catch (error) {
      console.error('Error in produce handler:', error);
      callback({ error: error.message });
    }
  });
}

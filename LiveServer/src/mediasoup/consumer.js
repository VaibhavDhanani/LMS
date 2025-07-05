export async function handleConsumeProducer({ socket, mediasoupTransports, consumersMap }) {
  socket.on('consumeProducer', async ({ transportId, producerId, rtpCapabilities }, callback) => {
    try {
      const transport = mediasoupTransports.get(transportId);
      if (!transport) return callback({ error: 'Transport not found' });

      const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: false,
      });

      if (!consumersMap.has(socket.id)) {
        consumersMap.set(socket.id, []);
      }
      consumersMap.get(socket.id).push(consumer);

      consumer.on('close', () => {
        console.log(`Consumer closed: ${consumer.id}`);
      });

      await consumer.resume();

      callback({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    } catch (error) {
      console.error('Error in consume handler:', error);
      callback({ error: error.message });
    }
  });
}

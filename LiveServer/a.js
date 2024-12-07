socket.on('produce', async ({ transportId, kind, rtpParameters }, callback) => {
    console.log("producingserver");
    const transport = producerTransports.get(socket.id);
    if (transport) {
      const producer = await transport.produce({ kind, rtpParameters });
      callback({ id: producer.id });
    } else {
      callback({ error: 'Transport not found' });
    }
  });

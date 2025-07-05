export function handleTransport({ socket, router, mediasoupTransports, publicIp }) {
  socket.on('createTransport', async ({ direction }, callback) => {
    try {
      const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: '0.0.0.0', announcedIp: publicIp }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
      });

      transport._data = { socketId: socket.id };
      mediasoupTransports.set(transport.id, transport);

      transport.on('close', () => {
        mediasoupTransports.delete(transport.id);
      });

      callback({
        transportParams: {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        },
      });
    } catch (error) {
      console.error('Error creating transport:', error);
      callback({ error: error.message });
    }
  });

  socket.on('connectTransport', async ({ transportId, dtlsParameters }, callback) => {
    try {
      const transport = mediasoupTransports.get(transportId);
      if (!transport) throw new Error('Transport not found');
      await transport.connect({ dtlsParameters });
      callback({ success: true });
    } catch (error) {
      console.error('Error connecting transport:', error);
      callback({ error: error.message });
    }
  });
}

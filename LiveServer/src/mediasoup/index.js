import { createWorker } from 'mediasoup';
import { handleProduce } from './producer.js';
import { handleConsumeProducer } from './consumer.js';
import { handleTransport } from './transport.js';
import { handleCleanup } from './cleanup.js';

let router;
const mediasoupTransports = new Map(); 
const consumersMap = new Map();        

let publicIp = null;

// Initialize Mediasoup router
export async function initMediasoupWorker(ip) {
  publicIp = ip;

  const worker = await createWorker();
  router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
      },
    ],
  });

  console.log('Mediasoup router initialized');
}

// Setup Mediasoup-related socket handlers
export function registerMediasoupHandlers(io, socket, rooms) {
  if (!router) {
    console.error('Router is not ready. Skipping mediasoup handlers.');
    return;
  }

  socket.on('getRtpCapabilities', (callback) => {
    callback({ rtpCapabilities: router.rtpCapabilities });
  });

  handleTransport({ socket, router, mediasoupTransports, publicIp });
  handleProduce({ io, socket, rooms, mediasoupTransports });
  handleConsumeProducer({ socket, mediasoupTransports, consumersMap });

  socket.on('disconnect', () => {
    handleCleanup({io, socket, rooms, mediasoupTransports, consumersMap });
  });
}

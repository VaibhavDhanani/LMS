require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createWorker } = require('mediasoup');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Environment variables with defaults
const config = {
	PORT: process.env.PORT || 3000,
	PUBLIC_IP: process.env.PUBLIC_IP || '127.0.0.1',
	ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '*').split(','),
	NODE_ENV: process.env.NODE_ENV || 'development',
	WORKER_POOL_SIZE: parseInt(process.env.WORKER_POOL_SIZE || '1', 10)
};

// Express app setup with security middleware
const app = express();
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: config.ALLOWED_ORIGINS,
		methods: ['GET', 'POST'],
		credentials: true
	}
});

// Mediasoup setup
let router;
const mediasoupWorkers = [];
const mediasoupTransports = new Map();
const producers = new Map();
const consumers = new Map();
const rooms = new Map();

// Worker management
let nextWorkerIndex = 0;
const getNextWorker = () => {
	const worker = mediasoupWorkers[nextWorkerIndex];
	nextWorkerIndex = (nextWorkerIndex + 1) % mediasoupWorkers.length;
	return worker;
};

function createRoomIfNotExists(roomId) {
	if (!rooms.has(roomId)) {
		rooms.set(roomId, new Set());
	}
	return rooms.get(roomId);
}

// Initialize Mediasoup workers
async function initializeMediasoupWorkers() {
	try {
		for (let i = 0; i < config.WORKER_POOL_SIZE; i++) {
			const worker = await createWorker({
				logLevel: config.NODE_ENV === 'production' ? 'error' : 'debug',
				logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
			});
			
			worker.on('died', () => {
				console.error(`Worker ${i} died, exiting in 2 seconds... [pid:${worker.pid}]`);
				setTimeout(() => process.exit(1), 2000);
			});
			
			const router = await worker.createRouter({
				mediaCodecs: [
					{
						kind: 'audio',
						mimeType: 'audio/opus',
						clockRate: 48000,
						channels: 2
					},
					{
						kind: 'video',
						mimeType: 'video/VP8',
						clockRate: 90000,
						parameters: {
							'x-google-start-bitrate': 1000
						}
					},
					{
						kind: 'video',
						mimeType: 'video/H264',
						clockRate: 90000,
						parameters: {
							'packetization-mode': 1,
							'profile-level-id': '4d0032',
							'level-asymmetry-allowed': 1
						}
					}
				]
			});
			
			mediasoupWorkers.push({ worker, router });
			console.log(`Worker ${i} initialized [pid:${worker.pid}]`);
		}
	} catch (error) {
		console.error('Failed to initialize mediasoup workers:', error);
		process.exit(1);
	}
}

// Initialize workers
initializeMediasoupWorkers().catch(error => {
	console.error('Failed to initialize application:', error);
	process.exit(1);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
	console.log(`Client connected: ${socket.id}`);
	
	let currentRoom = null;
	
	socket.on('joinLecture', async ({ roomId }, callback) => {
		try {
			const room = createRoomIfNotExists(roomId);
			currentRoom = roomId;
			socket.join(roomId);
			
			callback({
				success: true,
				producers: [...room]
			});
		} catch (error) {
			console.error('Join room error:', error);
			callback({ error: 'Failed to join room' });
		}
	});
	
	socket.on('getRtpCapabilities', (callback) => {
		try {
			const { router } = getNextWorker();
			callback({
				success: true,
				rtpCapabilities: router.rtpCapabilities
			});
		} catch (error) {
			console.error('Get RTP capabilities error:', error);
			callback({ error: 'Failed to get RTP capabilities' });
		}
	});
	
	socket.on('createTransport', async ({ direction }, callback) => {
		try {
			const { router } = getNextWorker();
			const transport = await router.createWebRtcTransport({
				listenIps: [
					{
						ip: '0.0.0.0',
						announcedIp: config.PUBLIC_IP
					}
				],
				enableUdp: true,
				enableTcp: true,
				preferUdp: true,
				initialAvailableOutgoingBitrate: 1000000,
				minimumAvailableOutgoingBitrate: 600000,
				maxSctpMessageSize: 262144
			});
			
			transport.on('dtlsstatechange', dtlsState => {
				if (dtlsState === 'closed') {
					transport.close();
				}
			});
			
			transport.on('close', () => {
				console.log('Transport closed:', transport.id);
				mediasoupTransports.delete(transport.id);
			});
			
			mediasoupTransports.set(transport.id, transport);
			
			callback({
				success: true,
				transportParams: {
					id: transport.id,
					iceParameters: transport.iceParameters,
					iceCandidates: transport.iceCandidates,
					dtlsParameters: transport.dtlsParameters
				}
			});
		} catch (error) {
			console.error('Create transport error:', error);
			callback({ error: 'Failed to create transport' });
		}
	});
	
	socket.on('connectTransport', async ({ transportId, dtlsParameters }, callback) => {
		try {
			const transport = mediasoupTransports.get(transportId);
			if (!transport) {
				throw new Error('Transport not found');
			}
			
			await transport.connect({ dtlsParameters });
			callback({ success: true });
		} catch (error) {
			console.error('Connect transport error:', error);
			callback({ error: 'Failed to connect transport' });
		}
	});
	
	socket.on('produce', async ({ transportId, kind, rtpParameters, roomId }, callback) => {
		try {
			const transport = mediasoupTransports.get(transportId);
			if (!transport) {
				throw new Error('Transport not found');
			}
			
			const producer = await transport.produce({ kind, rtpParameters });
			const producerInfo = {
				id: producer.id,
				kind: producer.kind,
				rtpParameters: producer.rtpParameters
			};
			
			const room = createRoomIfNotExists(roomId);
			room.add(producerInfo);
			producers.set(producer.id, producer);
			
			// Notify others in the room
			socket.to(roomId).emit('newProducer', producerInfo);
			
			producer.on('close', () => {
				producers.delete(producer.id);
				room.delete(producerInfo);
				socket.to(roomId).emit('producerClosed', { producerId: producer.id });
			});
			
			callback({
				success: true,
				producerId: producer.id
			});
		} catch (error) {
			console.error('Produce error:', error);
			callback({ error: 'Failed to produce media' });
		}
	});
	
	socket.on('consume', async ({ roomId, transportId, rtpCapabilities }, callback) => {
		try {
			const transport = mediasoupTransports.get(transportId);
			if (!transport) {
				throw new Error('Transport not found');
			}
			
			const room = rooms.get(roomId);
			if (!room) {
				throw new Error('Room not found');
			}
			
			const consumers = [];
			
			for (const producer of room) {
				try {
					const consumer = await transport.consume({
						producerId: producer.id,
						rtpCapabilities,
						paused: false
					});
					
					consumer.on('producerclose', () => {
						consumer.close();
						socket.emit('consumerClosed', { consumerId: consumer.id });
					});
					
					await consumer.resume();
					
					consumers.push({
						producerId: producer.id,
						id: consumer.id,
						kind: consumer.kind,
						rtpParameters: consumer.rtpParameters
					});
				} catch (error) {
					console.error('Error creating consumer:', error);
				}
			}
			
			callback({
				success: true,
				consumers
			});
		} catch (error) {
			console.error('Consume error:', error);
			callback({ error: 'Failed to consume media' });
		}
	});
	
	socket.on('disconnect', () => {
		console.log(`Client disconnected: ${socket.id}`);
		
		if (currentRoom) {
			socket.leave(currentRoom);
		}
		
		// Clean up transports
		for (const [transportId, transport] of mediasoupTransports.entries()) {
			if (transport._data && transport._data.socketId === socket.id) {
				transport.close();
			}
		}
	});
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		workers: mediasoupWorkers.length
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		error: 'Internal server error',
		message: config.NODE_ENV === 'development' ? err.message : undefined
	});
});

// Start server
server.listen(config.PORT, () => {
	console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM received. Shutting down gracefully...');
	server.close(() => {
		console.log('Server closed. Shutting down workers...');
		Promise.all(mediasoupWorkers.map(({ worker }) => worker.close()))
			.then(() => {
				console.log('All workers closed. Exiting...');
				process.exit(0);
			})
			.catch(error => {
				console.error('Error during shutdown:', error);
				process.exit(1);
			});
	});
});
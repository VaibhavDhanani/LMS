import express from 'express';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();

const AXINOM_CONFIG = {
	API_HOST: 'https://vip-eu-west-1.axinom.com/',
	TENANT_NAME: 'collage-13558-2539',
	MANAGEMENT_KEY: '4b64d9a4-04a8-41ca-97d6-c3cffaf186e0'
};

// API endpoint to encrypt video
router.post('/encrypt-video', async (req, res) => {
	try {
		const { video } = req.files; // Assuming you're using express-fileupload
		const encodingJob = await createEncodingJob(video);
		await uploadVideo(encodingJob.uploadUrl, video);
		await startEncoding(encodingJob.id);
		const result = await waitForEncodingCompletion(encodingJob.id);
		
		res.json({
			jobId: encodingJob.id,
			manifestUrl: result.manifestUrl,
			encryptedUrl: result.encryptedUrl
		});
	} catch (error) {
		console.error('Encryption failed:', error);
		res.status(500).json({ error: error.message });
	}
});

// Create encoding job
async function createEncodingJob(video) {
	const response = await axios.post(`${AXINOM_CONFIG.API_HOST}api/encoding/jobs`, {
		input: { fileName: video.name, fileSize: video.size },
		encryption: { type: 'Widevine', keyId: 'auto-generate' },
		output: { type: 'DASH', drm: true }
	}, {
		headers: {
			'Authorization': `Bearer ${AXINOM_CONFIG.MANAGEMENT_KEY}`,
			'X-Tenant': AXINOM_CONFIG.TENANT_NAME
		}
	});
	return response.data;
}

// Upload video to Axinom
async function uploadVideo(uploadUrl, video) {
	const formData = new FormData();
	formData.append('file', video.data, video.name);
	await axios.put(uploadUrl, formData, { headers: { ...formData.getHeaders() } });
}

// Start encoding process
async function startEncoding(jobId) {
	await axios.post(`${AXINOM_CONFIG.API_HOST}api/encoding/jobs/${jobId}/start`, {}, {
		headers: {
			'Authorization': `Bearer ${AXINOM_CONFIG.MANAGEMENT_KEY}`,
			'X-Tenant': AXINOM_CONFIG.TENANT_NAME
		}
	});
}

// Wait for encoding completion
async function waitForEncodingCompletion(jobId) {
	const maxAttempts = 60;
	let attempts = 0;
	while (attempts < maxAttempts) {
		const response = await axios.get(`${AXINOM_CONFIG.API_HOST}api/encoding/jobs/${jobId}`, {
			headers: {
				'Authorization': `Bearer ${AXINOM_CONFIG.MANAGEMENT_KEY}`,
				'X-Tenant': AXINOM_CONFIG.TENANT_NAME
			}
		});
		const status = response.data.status;
		if (status === 'Completed') {
			return {
				manifestUrl: response.data.output.dashManifestUrl,
				encryptedUrl: response.data.output.encryptedUrl
			};
		}
		if (status === 'Failed') {
			throw new Error('Encoding failed');
		}
		await new Promise(resolve => setTimeout(resolve, 5000));
		attempts++;
	}
	throw new Error('Encoding timeout');
}

export default router;

import { AXINOM_CONFIG } from '@/config/axinom';

export const encryptVideo = async (videoFile) => {
	try {
		// First, get a content key from Axinom
		const contentKey = await getContentKey();
		
		// Create FormData to send to your backend encryption endpoint
		const formData = new FormData();
		formData.append('video', videoFile);
		formData.append('contentKeyId', contentKey.id);
		formData.append('key', contentKey.key);
		
		// Send to your backend for encryption
		const response = await fetch('/api/encrypt-video', {
			method: 'POST',
			body: formData
		});
		
		if (!response.ok) throw new Error('Encryption failed');
		
		const { encryptedVideo, manifestUrl } = await response.json();
		
		return {
			encryptedVideo,
			manifestUrl,
			contentKeyId: contentKey.id
		};
	} catch (error) {
		console.error('Encryption failed:', error);
		throw error;
	}
};

const getContentKey = async () => {
	try {
		const response = await fetch('/api/generate-content-key', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				provider: AXINOM_CONFIG.WIDEVINE_PROVIDER,
				signingKey: AXINOM_CONFIG.WIDEVINE_SIGNING_KEY,
				signingIv: AXINOM_CONFIG.WIDEVINE_SIGNING_IV
			})
		});
		
		return await response.json();
	} catch (error) {
		console.error('Failed to get content key:', error);
		throw error;
	}
};
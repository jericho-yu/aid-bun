import crypto from 'crypto';

// SHA-256 encoding
export const sha256 = async (original) => {
	const hash = crypto.createHash('sha256');
	hash.update(original);
	return hash.digest('hex');
};

// Example usage
if (require.main == module) console.log(`SHA-256 Hash: ${await sha256("Hello, this is a test string!")}`);

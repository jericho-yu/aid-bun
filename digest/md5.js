import crypto from 'crypto';

// MD5 encoding
export const md5 = async (original) => {
	const hash = crypto.createHash('md5');
	hash.update(original);
	return hash.digest('hex');
};

// Example usage
if (require.main == module) console.log(`MD5 Hash: ${await md5("Hello, this is a test string!")}`);

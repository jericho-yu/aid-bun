import sm3 from 'sm3';

// SM3 encoding
export const sm3Hash = async (original) => {
	return sm3(original);
};

// Example usage
if (require.main == module) console.log(`SM3 Hash: ${await sm3Hash("Hello, this is a test string!")}`);


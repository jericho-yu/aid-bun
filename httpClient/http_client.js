import http from 'http';
import https from 'https';
import { URL } from 'url';
import fs from 'fs';
import xml2js from 'xml2js';
import querystring from 'querystring';
import FormData from 'form-data';

const HttpMethods = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	PATCH: 'PATCH',
	DELETE: 'DELETE'
};

const HttpContentTypes = {
	JSON: 'application/json',
	XML: 'application/xml',
	FORM: 'application/x-www-form-urlencoded',
	FORM_DATA: 'multipart/form-data',
	PLAIN: 'text/plain',
	HTML: 'text/html',
	CSS: 'text/css',
	JAVASCRIPT: 'application/javascript',
};

const AcceptTypes = {
	JSON: 'application/json',
	XML: 'application/xml',
	PLAIN: 'text/plain',
	HTML: 'text/html',
	CSS: 'text/css',
	JAVASCRIPT: 'application/javascript',
	STEAM: 'application/octet-stream',
	ANY: '*/*',
};

class HttpClient {
	constructor(url) {
		this.url = url;
		this.method = 'GET';
		this.headers = {};
		this.body = null;
		this.timeout = 0;
		this.cert = null;
		this.key = null;
		this.ca = null;
		this.responseBody = null;
		this.error = null;
	}

	static new = url => new HttpClient(url).setMethod(HttpMethods.GET);
	static newGet = url => new HttpClient(url).setMethod(HttpMethods.GET);
	static newPost = url => new HttpClient(url).setMethod(HttpMethods.POST);
	static newPut = url => new HttpClient(url).setMethod(HttpMethods.PUT);
	static newPatch = url => new HttpClient(url).setMethod(HttpMethods.PATCH);
	static newDelete = url => new HttpClient(url).setMethod(HttpMethods.DELETE);

	setCert(certPath, keyPath, caPath) {
		this.cert = fs.readFileSync(certPath);
		this.key = fs.readFileSync(keyPath);
		this.ca = fs.readFileSync(caPath);
		return this;
	}

	setUrl(url) {
		this.url = url;
		return this;
	}

	setMethod(method) {
		this.method = method;
		return this;
	};

	addHeaders(headers) {
		this.headers = { ...this.headers, ...headers };
		return this;
	}

	setAuthorization(username, password, title) {
		this.headers['Authorization'] = `${title} ${Buffer.from(`${username}:${password}`).toString('base64')}`;
		return this;
	}

	setHeaderContentType(key) {
		const value = this.getHeaderContentType(key);
		if (value) {
			this.headers['Content-Type'] = value;
		}
		return this;
	}

	getHeaderContentType(key) {
		return HttpContentTypes[key] || '';
	}

	async setHeaderAccept(key) {
		const value = AcceptTypes[key];
		if (value) {
			this.headers['Accept'] = [value];
		}

		return this;
	}

	getHeaderAccept(key) {
		return AcceptTypes[key] || '';
	}

	setBody(body) {
		this.body = body;
		return this;
	}

	setJsonBody(body) {
		this.setHeaderContentType(HttpContentTypes.JSON);
		this.body = JSON.stringify(body);

		return this;
	}

	setXmlBody() {
		this.setHeaderContentType(HttpContentTypes.XML);
		this.body = (xml2js.Builder()).buildObject(body);

		return this;
	}

	setFormBody(body) {
		this.setHeaderContentType(HttpContentTypes.FORM);
		this.body = querystring.stringify(body);

		return this;
	}

	setFormDataBody(texts, files) {
		this.setHeaderContentType(HttpContentTypes.FORM_DATA);
		const form = new FormData();

		if (texts) {
			for (const [key, value] of Object.entries(texts)) {
				form.append(key, value);
			}
		}

		if (files) {
			for (const [key, filePath] of Object.entries(files)) {
				form.append(key, fs.createReadStream(filePath));
			}
		}

		this.body = form;

		return this;
	}

	setPlainBody(body) {
		this.setHeaderContentType(HttpContentTypes.PLAIN);
		this.body = Buffer.from(body, 'utf-8');

		return this;
	}

	setCssBody(body) {
		this.setHeaderContentType(HttpContentTypes.CSS);
		this.body = Buffer.from(body, 'utf-8');

		return this;
	}

	setJavascriptBody(body) {
		this.setHeaderContentType(HttpContentTypes.JAVASCRIPT);
		this.body = Buffer.from(body, 'utf-8');

		return this;
	}

	setSteamBody(filename) {
		try {
			const file = fs.readFileSync(filename);
			const size = file.length;

			this.body = file;
			this.headers['Content-Length'] = size.toString();
		} catch (err) {
			this.err = err;
		}

		return this;
	}

	setTimeout(timeout) {
		this.timeout = timeout;
		return this;
	}

	async send() {
		return new Promise((resolve, reject) => {
			const urlObj = new URL(this.url);
			const options = {
				method: this.method,
				headers: this.headers,
				timeout: this.timeout,
				cert: this.cert,
				key: this.key,
				ca: this.ca,
			};

			const lib = urlObj.protocol === 'https:' ? https : http;
			const req = lib.request(urlObj, options, (res) => {
				let data = [];
				res.on('data', (chunk) => data.push(chunk));
				res.on('end', () => resolve(Buffer.concat(data)));
			});

			req.on('error', reject);

			if (this.body) {
				req.write(this.body);
			}

			req.end();
		})
			.then(res => this.responseBody = res)
			.catch(err => this.err = err)
			.finally(function () { return this; })
	}
}

export default { HttpClient, HttpMethods, HttpContentTypes, AcceptTypes };

// example usage
if (require.main == module) {
	let res = await HttpClient.new("https:www.baidu.com").send();
	console.log(`${res}`);
}

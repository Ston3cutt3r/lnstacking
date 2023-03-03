import { navigate } from 'svelte-navigator';

const constructUrl = (url) => {
	try {
		return new URL(url);
	} catch {
		return new URL(`${location.origin}${url}`);
	}
};

export const login = () => {
	navigate('/login', { state: { from: location.pathname }, replace: true });
};

export const httpGet = async (url) => {
	url = constructUrl(url);
	const search = [url.search.replaceAll('?', ''), location.search.replaceAll('?', '')].filter((filter) => filter).join('&');
	const response = await fetch(`${url.origin}${url.pathname}?${search}`, {
		method: 'GET',
		headers: { authorization: localStorage.getItem('token') },
	});
	return await handleResponse(response);
};

export const httpPost = async (url, data) => {
	url = constructUrl(url);
	const search = [url.search.replaceAll('?', ''), location.search.replaceAll('?', '')].filter((filter) => filter).join('&');
	const response = await fetch(`${url.origin}${url.pathname}?${search}`, {
		method: 'POST',
		headers: { authorization: localStorage.getItem('token'), 'content-type': 'application/json' },
		body: JSON.stringify(data),
	});
	return await handleResponse(response);
};

export const httpPatch = async (url, data) => {
	url = constructUrl(url);
	const search = [url.search.replaceAll('?', ''), location.search.replaceAll('?', '')].filter((filter) => filter).join('&');
	const response = await fetch(`${url.origin}${url.pathname}?${search}`, {
		method: 'PATCH',
		headers: { authorization: localStorage.getItem('token'), 'content-type': 'application/json' },
		body: JSON.stringify(data),
	});
	return await handleResponse(response);
};

export const httpDelete = async (url) => {
	url = constructUrl(url);
	const search = [url.search.replaceAll('?', ''), location.search.replaceAll('?', '')].filter((filter) => filter).join('&');
	const response = await fetch(`${url.origin}${url.pathname}?${search}`, {
		method: 'DELETE',
		headers: { authorization: localStorage.getItem('token') },
	});
	return await handleResponse(response);
};

const handleResponse = async (response) => {
	if (response.status === 401) return login();
	if (response.status < 200 || response.status >= 300) throw { error: 'Request Unsuccessful', details: response };
	return await response.text();
};

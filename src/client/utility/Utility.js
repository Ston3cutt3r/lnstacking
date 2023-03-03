import { sha512 } from 'js-sha512';

export const filledArray = (size) => {
	return Array(size)
		.fill(0)
		.map((value, index) => index);
};

export const getHash = async (input) => {
	return sha512(input);
};

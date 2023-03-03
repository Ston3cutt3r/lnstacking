import { v4 as uuid } from 'uuid';

const softAssign = (a, b) => {
	if (b) {
		for (const key of Object.keys(a)) {
			if (b[key] !== undefined) {
				if (Array.isArray(a[key]) || typeof a[key] !== 'object') a[key] = b[key];
				else softAssign(a[key], b[key]);
			}
		}
	}
	return a;
};

export default (data = {}) => {
	return softAssign(
		{
			id: uuid(),
			email: '',
			password: '',
			createdAt: new Date() - 0,
			emailConfirmedAt: null,
			role: 'user',
			token: null,

			stxAddress: '',
			btcAddress: '',
			lnKey: '',

			firstName: '',
			lastName: '',
			street: '',
			zipCode: '',
			city: '',
			country: '',
			dateOfBirthDay: 1,
			dateOfBirthMonth: 1,
			dateOfBirthYear: 2004,
			document: '',
			documentId: '',
			documentName: '',
			kycConfirmedAt: null,
			kycFailureNote: null,
		},
		data
	);
};

import fs from 'fs';
import express from 'express';
import fetch from 'node-fetch';
import CryptoJS from 'crypto-js';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { StackingClient } from '@stacks/stacking';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { getNonce, makeContractCall } from '@stacks/transactions';

import User from './User.js';
import { storage } from './Storage.js';
import { sendEmail } from './Email.js';
import { lnNodeKey, passphrase, stxDelegationAddress, lnChannelAddress, poolAddress, poolPrivateKey, environment, adminEmail, domain } from '../../config.js';

const checkDatabase = async () => {
	const users = storage('users');
	const keys = await users.keys();
	for (const key of keys) {
		const user = await users.get(key);
		if (!user.email) await users.delete(key);
	}
};

const whoAreYou = async (request) => {
	if (request.headers.authorization) {
		const token = CryptoJS.AES.decrypt(request.headers.authorization, passphrase).toString(CryptoJS.enc.Utf8);
		const id = token.slice(0, token.indexOf('///'));
		const user = await storage('users').get(id);
		if (user && user.token === request.headers.authorization) return user;
	}
};

export const createRouter = async (production = false) => {
	const router = express.Router();
	router.use(express.json({ limit: '250mb' }));
	checkDatabase();

	router.post('/api/login', async (request, response) => {
		try {
			const userStorage = storage('users');
			for (const key of await userStorage.keys()) {
				const user = await userStorage.get(key);
				if (request.body.email === user.email) {
					if (request.body.password !== user.password) break;
					user.token = CryptoJS.AES.encrypt(`${user.id}///${uuid()}${uuid()}${uuid()}`, passphrase).toString();
					await userStorage.set(user.id, user);
					const userData = JSON.parse(JSON.stringify(user));
					delete userData.password;
					return response.status(200).json(userData).end();
				}
			}
			return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/register', async (request, response) => {
		try {
			const userStorage = storage('users');
			for (const key of await userStorage.keys()) {
				const user = await userStorage.get(key);
				if (request.body.email === user.email) return response.status(500).end();
			}
			const user = User({ email: request.body.email, password: request.body.password, role: request.body.email === adminEmail ? 'admin' : 'user' });
			user.token = CryptoJS.AES.encrypt(`${user.id}///${uuid()}${uuid()}${uuid()}`, passphrase).toString();
			await userStorage.set(user.id, user);

			const token = CryptoJS.AES.encrypt(`${user.id}///${user.email}///${user.password}///${user.createdAt}`, passphrase).toString();
			sendEmail(user.email, 'Confirm Email Address', `Click here to confirm your email address: https://${domain}/?token=${encodeURIComponent(token)}`).catch(console.error);

			const userData = JSON.parse(JSON.stringify(user));
			delete userData.password;
			return response.status(200).json(userData).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/resendConfirmation', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (user) {
				const token = CryptoJS.AES.encrypt(`${user.id}///${user.email}///${user.password}///${user.createdAt}`, passphrase).toString();
				sendEmail(user.email, 'Confirm Email Address', `Click here to confirm your email address: https://${domain}/?token=${encodeURIComponent(token)}`).catch(console.error);
				return response.status(200).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/confirmEmail', async (request, response) => {
		try {
			const token = CryptoJS.AES.decrypt(request.body.token, passphrase).toString(CryptoJS.enc.Utf8);
			const parameters = token.split('///');
			const userStorage = storage('users');
			const user = await userStorage.get(parameters[0]);

			if (!user) return response.status(500).end();
			if (user.email !== parameters[1]) return response.status(500).end();
			if (user.password !== parameters[2]) return response.status(500).end();
			if (user.createdAt !== parseInt(parameters[3])) return response.status(500).end();

			user.emailConfirmedAt = new Date() - 0;
			await userStorage.set(user.id, user);
			return response.status(200).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/forgotPassword', async (request, response) => {
		try {
			const userStorage = storage('users');
			for (const key of await userStorage.keys()) {
				const user = await userStorage.get(key);
				if (request.body.email === user.email) {
					const token = CryptoJS.AES.encrypt(`${user.id}///${user.email}///${user.password}///${user.createdAt}`, passphrase).toString();
					sendEmail(user.email, 'Reset Password', `Click here to reset your password: https://${domain}/resetPassword?token=${encodeURIComponent(token)}`).catch(console.error);
				}
			}
			return response.status(200).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/resetPassword', async (request, response) => {
		try {
			const token = CryptoJS.AES.decrypt(request.body.token, passphrase).toString(CryptoJS.enc.Utf8);
			const parameters = token.split('///');
			const userStorage = storage('users');
			const user = await userStorage.get(parameters[0]);

			if (!user) return response.status(500).end();
			if (user.email !== parameters[1]) return response.status(500).end();
			if (user.password !== parameters[2]) return response.status(500).end();
			if (user.createdAt !== parseInt(parameters[3])) return response.status(500).end();

			user.password = request.body.password;
			await userStorage.set(user.id, user);
			return response.status(200).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/logout', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (user) {
				user.token = undefined;
				await storage('users').set(user.id, user);
			}
			return response.status(200).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.get('/api/whoami', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (user) {
				delete user.password;
				user.role = user.email === adminEmail ? 'admin' : user.role;
				return response.status(200).json(user).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.get('/api/config', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (user) {
				return response.status(200).json({ lnChannelAddress, stxDelegationAddress, environment, poolAddress }).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/paymentInfo', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (user) {
				user.stxAddress = request.body.stxAddress;
				user.btcAddress = request.body.btcAddress;
				user.lnKey = request.body.lnKey;
				await storage('users').set(user.id, user);
				const userData = JSON.parse(JSON.stringify(user));
				delete userData.password;
				return response.status(200).json(userData).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/delegate', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (user) {
				const network = environment === 'production' ? new StacksMainnet() : new StacksTestnet();
				const poolClient = new StackingClient(stxDelegationAddress, network);
				const result = await poolClient.delegateStackStx({
					stacker: request.body.stacker,
					amountMicroStx: request.body.amountMicroStx,
					poxAddress: poolAddress,
					burnBlockHeight: request.body.burnBlockHeight,
					cycles: request.body.cycles,
					privateKey: poolPrivateKey,
					nonce: (await getNonce(stxDelegationAddress, network)) + 1n,
				});
				if (result.error) throw result;
				return response.status(200).json(result).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/commit', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (user) {
				const network = environment === 'production' ? new StacksMainnet() : new StacksTestnet();
				const poolClient = new StackingClient(stxDelegationAddress, network);
				const poxInfo = await poolClient.getPoxInfo();
				const rewardCycle = poxInfo.next_cycle.id;
				let allowContractCaller = await makeContractCall({
					network: network,
					contractAddress: poxInfo.contract_id.split('.')[0],
					contractName: poxInfo.contract_id.split('.')[1],
					functionName: 'allow-contract-caller',
					functionArgs: [],
					senderKey: poolPrivateKey,
				});
				allowContractCaller = JSON.parse(JSON.stringify(allowContractCaller, (key, value) => (typeof value === 'bigint' ? value.toString() : value)));
				const stackAggregationCommit = await poolClient.stackAggregationCommit({
					rewardCycle: rewardCycle,
					poxAddress: poolAddress,
					privateKey: poolPrivateKey,
				});
				return response.status(200).json({ allowContractCaller, stackAggregationCommit }).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.get('/api/lnChannel', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (user) {
				const lnChannels = await (await fetch(`https://mempool.space/api/v1/lightning/channels?public_key=${lnNodeKey}&index=0&status=open`)).json();
				const lnChannel = lnChannels.find((channel) => channel.node.public_key === request.query.lnKey) ?? null;
				return response.status(200).json(lnChannel).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.get('/api/rewards', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (user) {
				const rewards = await (await fetch(`https://stacks-node-api.${environment === 'production' ? 'mainnet' : 'testnet'}.stacks.co/extended/v1/burnchain/rewards/${stxDelegationAddress}/total`)).json();
				return response.status(200).json(rewards).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/kyc', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (user) {
				user.firstName = request.body.firstName;
				user.lastName = request.body.lastName;
				user.street = request.body.street;
				user.zipCode = request.body.zipCode;
				user.city = request.body.city;
				user.country = request.body.country;
				user.dateOfBirthDay = request.body.dateOfBirthDay;
				user.dateOfBirthMonth = request.body.dateOfBirthMonth;
				user.dateOfBirthYear = request.body.dateOfBirthYear;
				user.document = request.body.document;
				user.documentId = request.body.documentId;
				user.documentName = request.body.documentName;

				user.kycFailureNote = undefined;
				user.kycConfirmedAt = undefined;
				await storage('users').set(user.id, user);
				return response.status(200).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/kyc/approve', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (!user) return response.status(401).end();
			if (user.role !== 'admin' && user.email !== adminEmail) return response.status(403).end();
			const userStorage = storage('users');
			const selectedUser = await userStorage.get(request.body.id);
			if (selectedUser) {
				selectedUser.kycFailureNote = undefined;
				selectedUser.kycConfirmedAt = new Date() - 0;
				await storage('users').set(selectedUser.id, selectedUser);
				return response.status(200).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/kyc/deny', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (!user) return response.status(401).end();
			if (user.role !== 'admin' && user.email !== adminEmail) return response.status(403).end();
			const userStorage = storage('users');
			const selectedUser = await userStorage.get(request.body.id);
			if (selectedUser) {
				selectedUser.kycConfirmedAt = undefined;
				selectedUser.kycFailureNote = request.body.kycFailureNote || 'No note specified.';
				await storage('users').set(selectedUser.id, selectedUser);
				return response.status(200).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.get('/api/admin', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (!user) return response.status(401).end();
			if (user.role !== 'admin' && user.email !== adminEmail) return response.status(403).end();
			const userStorage = storage('users');
			const keys = await userStorage.keys();
			const users = await Promise.all(keys.map((key) => userStorage.get(key)));
			for (const user of users) delete user.password;
			return response.status(200).json(users).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	router.post('/api/admin', async (request, response) => {
		try {
			const user = await whoAreYou(request);
			if (!user) return response.status(401).end();
			if (user.role !== 'admin' && user.email !== adminEmail) return response.status(403).end();
			const userStorage = storage('users');
			const selectedUser = await userStorage.get(request.body.id);
			if (selectedUser) {
				selectedUser.role = selectedUser.email === adminEmail ? 'admin' : request.body.role;
				await storage('users').set(selectedUser.id, selectedUser);
				return response.status(200).end();
			} else return response.status(401).end();
		} catch (error) {
			console.error(error);
			return response.status(500).json(error).end();
		}
	});

	if (production) {
		const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
		router.use(express.static(join(root, 'dist')));
		const index = fs.readFileSync(join(root, 'dist', 'index.html'), 'utf8');
		router.use('*', (request, response) => response.send(index));
	}
	return router;
};

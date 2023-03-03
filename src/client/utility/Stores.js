import { v4 as uuid } from 'uuid';
import { writable } from 'svelte/store';
import { AppConfig, UserSession } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });
export const walletData = new writable(userSession.isUserSignedIn() ? userSession.loadUserData() : undefined);

export const user = new writable();

const errorsInternal = {};
export const errors = new writable(errorsInternal);
let wrapped = false;
if (!wrapped) {
	const consoleError = console.error;
	const wrapper = (...args) => {
		const id = uuid();
		errorsInternal[id] = { id: id, date: new Date() - 0, message: args };
		errors.set(errorsInternal);
		setTimeout(() => {
			delete errorsInternal[id];
			errors.set(errorsInternal);
		}, 5000);
		consoleError(...args);
	};
	console.error = wrapper;
	wrapped = true;
}

const notificationsInternal = {};
export const notifications = new writable(notificationsInternal);
export const addNotification = (message, duration = 5000) => {
	const id = uuid();
	notificationsInternal[id] = { id: id, date: new Date() - 0, message: [message] };
	notifications.set(notificationsInternal);
	setTimeout(() => {
		delete notificationsInternal[id];
		notifications.set(notificationsInternal);
	}, duration);
};

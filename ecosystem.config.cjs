module.exports = {
	apps: [
		{
			name: 'lnstacking_database',
			script: 'npm',
			args: 'run database',
			cwd: './',
			cron_restart: '0 0 * * *',
		},
		{
			name: 'lnstacking_server',
			script: 'node',
			args: './src/server',
			cwd: './',
			cron_restart: '0 0 * * *',
		},
	],
};

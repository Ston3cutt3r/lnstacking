## Installation

```bash
echo 'Installing Node and Redis';
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg;
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list;
sudo apt-get update -y;
sudo apt-get install -y git redis-stack-server;
sudo systemctl disable redis-stack-server.service;
exec bash;
nvm install node;
```

```bash
echo 'Installing Project Dependencies';
npm install;
npm install pm2 -g;
npm run build;
```

```bash
echo 'Installing CertBot';
sudo apt install snapd -y;
sudo snap install core;
sudo snap refresh core;
sudo snap install --classic certbot;
sudo certbot certonly --standalone --domains lnstacking.com;
sudo cp /etc/letsencrypt/live/lnstacking.com/privkey.pem ./privkey.pem
sudo cp /etc/letsencrypt/live/lnstacking.com/fullchain.pem ./fullchain.pem
sudo chmod 777 ./privkey.pem ./fullchain.pem
```

```bash
echo 'Setting up Port Forwarding';
sudo iptables -t nat -F;
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000;
sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 4000;
sudo /sbin/iptables-save;
```

```bash
echo 'Setting up Application';
pm2 start ecosystem.config.cjs;
pm2 save;
pm2 startup;
```

## Configuration

Configuration of the project is done through the config.js file. A template for the file is set up within config.template.js. Create a copy of that file, rename it to config.js and fill it with your data.

- passphrase
  - This string is used internally for authentication token encryption. If you suspect that the string has been leaked, change it. This will invalidate any active authentication tokens.
- adminEmail
  - The user with this email address will always be considered an admin for the application. Admin users can promote others to admins, but admin privileges can never be taken away from the user with the adminEmail
- email
  - These settings are used for sending confirmation and password reset emails. Code for the usage can be found within the Email.js file. Depending on the email provider, different settings may have to be used. Information on the password used can be found here: https://support.google.com/accounts/answer/185833?hl=en. Information on service options can be found here: https://nodemailer.com/smtp/well-known/.
- lnChannelAddress
  - This is the lightning channel address users will be directed to create a channel to.
- lnNodeKey
  - This is the public key of the lightning network node. It is used to retrieve active channel data.
- stxDelegationAddress
  - This is the address that users will be delegating their STX to.
- poolAddress
  - This is the POX address the pool is going to use.
- poolPrivateKey
  - This is the private key for the given POX pool address.
- environment
  - This should be "development" or "production" to change between the STX test net and the main net.
- domain
  - This is the domain the website will be hosted on. This mainly affects email links.

## Miscellaneous Commands

```bash
# Restarting services
pm2 restart all
```

```bash
# Checking on services
pm2 status
```

```bash
# Checking service logs
pm2 logs
```

```bash
# Renewing SSL certificates
pm2 stop all;
sudo iptables -t nat -F;
sudo /sbin/iptables-save;
sudo certbot certonly --standalone --domains lnstacking.com;
sudo cp /etc/letsencrypt/live/lnstacking.com/privkey.pem ./privkey.pem
sudo cp /etc/letsencrypt/live/lnstacking.com/fullchain.pem ./fullchain.pem
sudo chmod 777 ./privkey.pem ./fullchain.pem
sudo iptables -t nat -F;
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000;
sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 4000;
sudo /sbin/iptables-save;
pm2 restart all;
```

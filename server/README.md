# GoLang Server

![Dependency Tree](https://www.plantuml.com/plantuml/png/POy_JmCn3CLtVmflJEtjg4CHxSW2x2XDt6j4_aIEhwSAzRkJQ-WVBaCi--UyvBrr5iKoU8SVmeEMWGdW2LzZEg4SR4OR9E919ENdhXl7SPcS2fDWgQFlhaCtdQ9JmM1MHofQme5TaL_Qz-tBvcsBU-i8TxIFJ5ZatehOqAC-gD1J1X0hZd13YOAXe4_uoKG0--WCyMI5E2Y7Fu3rgKny9FxgumMT0KhzkwnIgl2ET0p2qJdYF5_vQCWrz6XflCBppKRwxY_iwihtkzrSAJarEkrDOMMUcjLgiRZRlwDY6-36Rso67gC0F0nrMzCqlEPfSJ7Rm1ghmTLVAVy-WZK5CtZt2m00)

## Development install

### 1. Dependencies

#### 1.1. Please install the following:

- [docker](https://docs.docker.com/desktop/)
- [golang](https://go.dev/dl/)

#### 1.2. Install the advised vscode extensions.

These extensions will popup as advised extensions

#### 1.3. Install the golang extension dependencies

1. Press `ctrl` + `p` (MacOS: `command` + `p`)
2. Paste `>Go: Install/Update Tools` into text input
3. Select all options
4. click **OK**

### 2. Start database and mailhog via docker

`make docker-start`

### 3. Setup config files

Copy `/server/config.example.yml` to `/server/config.dev.yml`

Some values are obfuscated how to add these are explained below

#### 3.1. Add stripe dev keys

This is required for payment calls, if you are not working on those calls these steps are not needed

1. Create a stripe account
2. Download and install the stripe cli https://stripe.com/docs/stripe-cli
3. From https://dashboard.stripe.com/test/apikeys
   1. Copy secret key to `stripe_secret_key` in `/server/config.yml`
   2. Copy publishable key to `VITE_STRIPE_PUBLIC_KEY` in `/frontend/.env`
4. Go to [webhooks](https://dashboard.stripe.com/test/webhooks) and click **Add an endpoint**
   1. Set Endpoint url `http://localhost:8080/v1/payment/webhook`
   2. Click **add endpoint**

#### 3.2 Add database password

You must do this for the server to run properly.

Copy the value of `MYSQL_PASSWORD` found in `/server/docker/docker-compose.yml`, use the password to fill in `db_pass` in `/server/config.dev.yml`

#### 3.3 Copy to test config

Copy `/server/config.dev.yml` to `/server/config.test.yml`

This enables tests to use the same database.

### 4. Start server

`make start`

### 5. Generate fake data (optional)

If you want you can create some fake data to use in your development environment.
To do so run this command:

`make generate-fake-data`

Then setup some default users, a user for each permission role.
Run the following in your database client of choice:

[dev-setup-users.sql](https://github.com/the-clothing-loop/website/blob/main/server/sql/dev-setup-users.sql)

### 6. Setup Rest client

To document, test and use the server independently, [Postman](https://www.postman.com/) is to be used.

#### 6.1. Install Postman

Install one of the Postman Rest client options here:

1. app: https://www.postman.com/downloads/
2. browser agent: https://www.postman.com/downloads/postman-agent/
3. cli: https://learning.postman.com/docs/postman-cli/postman-cli-installation/

#### 6.2. Use project in postman

Here is the link to the postman collection: https://www.postman.com/the-clothing-loop/workspace/the-clothing-loop/overview

Be warned that everything saved is publicly available if you want to save, remove the sensitive data beforehand or use an environment variable

## Commands

### Start as dev

`make start`

### Build for VPS

`make build-server`

### Build for Shared Hosting

This is an attempt to use shared hosting, but has never been properly tested.

`make build-server-fcgi`

### Run tests

`make test`

### Run docker

This is to create a test environment
It includes handy environments to test:

- database queries
- email smtp test server (TODO)

`make docker-start`

And to stop the docker containers

`make docker-stop`

### Lint

Although the `golang.go` vscode extension should lint your code for you, there is also a command as well:

`make lint`

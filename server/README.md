# GoLang Server

![Dependency Tree](https://www.plantuml.com/plantuml/png/PO-_RZ8n4CJxVOhjlWgk_qH152ZJHEaZOo-75V-nx8KJYdZts5Xdu5nOylvcPpMpJImYdws1V_ZkmnNvf1DgnnvFp27z7uPfcjR125UsrjBROHw6yh9FE8L9N2Xx2S_HPFlz-xb_sttiyQWDuO6EFX9ckzNCseqeJyADb01Oio7SKI2doCahVaKYWACtYcA9Gj49Wx-0zLIYUA7uFVexkW4KeIwB42fy8EaTHsyCnRIKh5TaEbhEQqaTlsYQPdXhySBFU6TpMZiU3aidfz3vf5MPvRbyDflLwb6heL87eF765kYv8i3JKDNQikEjPw-KfZqkDJfO2_Uu9TUINdD0bbx0bfmwM_C7)

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

## Setting up authentication in Postman

| Variable | Type    | Example                                    | Description                                   |
| -------- | ------- | ------------------------------------------ | --------------------------------------------- |
| base     | default | http://localhost:8084                      | Base server url                               |
| token    | secret  | \*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\* | Login, in a browser and find the token cookie |
| userUID  | default | e896d087-5dd0-44fa-a549-2ead33a63d7a       | User UID                                      |
| chainUID | default | 48ca9112-912a-43b4-a8bc-16dcd79f383d       | Chain UID                                     |

1. Here's how to find cookies from the website:
   Chromium: https://superuser.com/a/1114501
   Firefox: https://firefox-source-docs.mozilla.org/devtools-user/storage_inspector/index.html
2. Select the cookie named `token` and copy its value
3. Paste the value into Postman
4. Make sure that the `userUID` is from the account you logged in with
5. If you want to send api requests that have a higher authentication level;
   - **AuthState3AdminChainUser** & **AuthState2UserOfChain**: you need to set the `chainUID` to a loop that will relate to the user (see `user_chains` table) and if need be, have `user_chains.is_chain_admin` set to **True**.
   - **AuthState4RootUser**: you need to set the `users.is_root_admin` database cell to **True**.

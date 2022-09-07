# GoLang Server

## Development install

### 1. Dependencies

#### 1.1. Please install the following:

- [docker](https://docs.docker.com/desktop/)
- [golang](https://go.dev/dl/)

#### 1.2. Install the advised vscode extensions.

These extensions will popup as advised extensions

#### 1.3. Install the golang extension dependencies

1. Press `ctrl` + `t`
2. Paste `>Go: Install/Update Tools` into text input
3. Select all options
4. click **OK**

### 2. Start database and mailhog via docker

`make docker-start`

### 3. Setup config files

Copy `/server/config.example.yml` to `/server/config.yml`

Some values are obfuscated how to add these are explained below

#### 3.1. Add stripe dev keys

This is required for payment calls, if you are not working on those calls these steps are not needed

1. Create a stripe account
2. Download and install the stripe cli https://stripe.com/docs/stripe-cli
3. From https://dashboard.stripe.com/test/apikeys
   1. Copy secret key to `stripe_secret_key` in `/server/config.yml`
   2. Copy publishable key to `REACT_APP_STRIPE_PUBLIC_KEY` in `/frontend/.env`
4. Go to [webhooks](https://dashboard.stripe.com/test/webhooks) and click **Add an endpoint**
   1. Set Endpoint url `http://localhost:8080/v1/payment/webhook`
   2. Click **add endpoint**

#### 3.2 Add database password

You must do this for the server to run properly.

Copy the value of `MYSQL_PASSWORD` found in `/server/docker/docker-compose.yml`, use the password to fill in `db_pass` in `/server/config.yml`

### 4. Start server

`make start`

### 5. Generate fake data (optional)

If you want you can create some fake data to use in your development environment.
To do so run this command:

`make generate-fake-data`

### 6. Setup Rest client

To document, test and use the server independently, [Insomnia](https://insomnia.rest/) is to be used.

#### 6.1. Install Insomnia

Install the Insomnia Rest client here:

- Win/Mac/Ubuntu: https://insomnia.rest/download
- Linux: https://flathub.org/apps/details/rest.insomnia.Insomnia

Then open Insomnia from your applications

#### 6.2. Import project to Insomnia

More documentation here: https://docs.insomnia.rest/insomnia/git-sync#set-up-a-remote-repository-with-github

1. Click **Create**
2. In the dropdown click **Git Clone**
3. Sign in to Github here (if you haven't done so)
   1. Open the Github tab
   2. Click **Authenticate with GitHub**
4. Paste in **GitHub URI** the following: `https://github.com/lil5/cl_insomnia.git`

#### 6.3. Create private environments

1. Type in `ctrl` + `e` or `command` + `e`
2. Select **Example Sub Environment** in the left side menu
3. Copy the json to your clipboard
4. Click the plus button next to **Sub Environments** and select **Private Environment** (this environment will not be added to the github repository for security and merge-conflict reasons)
5. Rename environment to Development
6. Select all of the empty json and paste
7. Change the values to those found in the corresponding database

When the new site is live and you have access to the production database do the same with and call it **Production**, give it a color too :sparkles:

#### 6.4. Understand how to sync changes

https://docs.insomnia.rest/insomnia/git-sync#commit-changes

This application just uses git: commit, push, pull.

Conflict must be done in an external editor like vscode.

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

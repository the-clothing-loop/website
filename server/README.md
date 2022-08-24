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

### 3. Start server

`make start`

### 4. Generate fake data (optional)

If you want you can create some fake data to use in your development environment.
To do so run this command:

`make generate-fake-data`

## Commands

### Start as dev

`make start`

### Build for VPS

`make build-server`

### Build for Shared Hosting

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

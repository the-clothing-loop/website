# Install on Linux

## Setup local development environment

### 1. Install tools

#### 1.1. NodeJS

https://nodejs.org/en/download/package-manager/

This project tries to stay on the latest LTS version (v18 as of writing)

#### 1.2. GoLang

Download from here https://go.dev/dl/

#### 1.3. GnuMake

Make sure that GnuMake is installed:

`make -v`

Or install it from **apt**

`sudo apt install -y make`

#### 1.4. Docker

Either install **Docker Desktop** or install docker engine for efficiency.

Make sure that your current user has docker rights:

`sudo usermod -aG docker $USER` then restart.

#### 1.5. Git

Make sure that Git is installed:

`git -v`

Or install it from **apt**

`sudo apt install -y git`

### 2. Fork and clone repository

> For new contributors it is best to first start with a fork, after their first PR, if they are interested in taking on more, they can be added to the project.

Go to the GitHub project [link](https://github.com/the-clothing-loop/website) and Click the Fork button, disable actions in fork.

Open a terminal and cd to your projects directory.

After creating your own fork, copy the url and replace it in this command
`git clone --depth 10 https://github.com/<user>/website.git clothing-loop`

Then this command adds the main repository as a remote.

```
cd clothing-loop
git remote add sfm https://github.com/CollActionteam/clothing-loop.git
git fetch sfm main
```

### 3. Follow install documentation

- Golang Server: [README.md](/server/README.md)
- React Frontend: [README.md](/frontend/README.md)

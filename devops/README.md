# DevOps

## Setup developers computer

### 1. Setup ssh access

If you don't have an ssh key create one

```
$ ssh-keygen -t rsa -b 4096 -C "my@email.com"
$ ssh-add ~/.ssh/id_rsa
```

Then add the public key `~/.ssh/id_rsa.pub` to the admin user via the vps dashboard, or ask someone who has access to add that for you.

Add this snippit to your `~/.ssh/config`:

```
Host vps1.clothingloop.org
    HostName vpsnode1.vps.webdock.cloud
    User admin
    IdentityFile ~/.ssh/id_rsa
```

### 2. Install ansible

Install ansible on your system, this can be done via python3-pip, brew, ubuntu ppa or dnf.

### 3. Add the variable file

Ask a someone for the file for `<project>/devops/group_vars/all.yml`.

An example of the contents is available at `/group_vars/all.yml.example`.

### 4. How to run a playbook

To run a playbook for example, to run update.yml

```
$ ansible-playbook update.yml
```

## How the VPS is/should be setup

Install Debian to a state where you can ssh into it.

If the choice is given make sure to _not_ install a desktop environment.

Install python3-minimal on the server.

The VPS is now setup to allow for Ansible to run playbooks on it.

All `setup-*-<name>.yml` are all created and used to setup the system.

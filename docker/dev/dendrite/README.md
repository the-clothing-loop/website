# Installing dendrite

Run the following commands first if there is no config directory:

```
mkdir config

# Generate a private key
docker run --rm \
   --entrypoint="/usr/bin/generate-keys" \
   -v ./config:/mnt matrixdotorg/dendrite-monolith:latest \
   -private-key /mnt/matrix_key.pem

# Generate config
docker run --rm \
   --entrypoint="/bin/sh" \
   -v ./config:/mnt matrixdotorg/dendrite-monolith:latest \
   -c "/usr/bin/generate-config \
   -dir /var/dendrite/ \
   -db postgres://dendrite:itsasecret@postgres/dendrite?sslmode=disable \
   -server YourDomainHere > /mnt/dendrite.yaml"
```

Create an admin account, the command will request a password to be entered

```

# Add admin account
docker compose exec -it monolith /usr/bin/create-account -admin -config /etc/dendrite/dendrite.yaml -username USERNAME

```

# Firebase migration

## TLDR

I'm assuming `config.dev.yaml` exists.

1.  Generate a private key file for your service account. In the Firebase console, open Settings > Service Accounts.
2.  Click Generate New Private Key, then confirm by clicking Generate Key.
3.  Securely store the JSON file containing the key. You may also check this [documentation](https://firebase.google.com/docs/admin/setup#initialize-sdk).
4.  Rename the JSON file to `credentials.json`.
5.  Run the following:

```sh
npm install -g firebase-tools

firebase login --interactive

npx firebase auth:export auth_data.json --format=json --project <project_id>

npx -p node-firestore-import-export firestore-export -a credentials.json -b backup.json
```

Your imported data should be in your local MariaDB.

## FireStore

> https://stackoverflow.com/a/70921800

Currently, Firestore does not support exporting existing data to a readable file but Firestore do have a managed [Exporting and importing data](https://cloud.google.com/firestore/docs/manage-data/export-import) that allows you to dump your data into a GCS bucket. It produces a format that is the same as Cloud Datastore uses. This means you can then import it into BigQuery.

However, community created a workaround for this limitation. You can use `npm` if you have installed it in your system. Below are the instructions to export the Firestore Data to `JSON` file using npm.

1.  Generate a private key file for your service account. In the Firebase console, open Settings > Service Accounts.
2.  Click Generate New Private Key, then confirm by clicking Generate Key.
3.  Securely store the JSON file containing the key. You may also check this [documentation](https://firebase.google.com/docs/admin/setup#initialize-sdk).
4.  Rename the JSON file to `credentials.json`.
5.  Enter the below code to your console:

```
npx -p node-firestore-import-export firestore-export -a credentials.json -b backup.json
```

6.  Follow the instructions prompted on your console.

You could also use this to import data to Firestore using below command:

```
npx -p node-firestore-import-export firestore-import -a credentials.json -b backup.json
```

Below are the results using `npm` from the package:

Firestore Collection: [![collection](https://i.stack.imgur.com/nLyA4.png)](https://i.stack.imgur.com/nLyA4.png)

Console: [![console](https://i.stack.imgur.com/awHWR.png)](https://i.stack.imgur.com/awHWR.png)

`backup.json`:

```
{"__collections__":{"test":{"Lq8u3VnOKvoFN4r03Ri1":{"test":"test","__collections__":{}}}}}
```

You can find more information regarding the package [here](https://www.npmjs.com/package/firestore-export-import).

## Firebase Authentication

```
firebase auth:export auth_data.json --format=json --project
```

> https://virendraoswal.com/export-firebase-authentication-data

### [Permalink](https://virendraoswal.com/export-firebase-authentication-data#heading-exporting-firebase-authentication-data-to-csv "Permalink")Exporting Firebase Authentication Data to CSV

- We first need to install Firebase CLI to get access to firebase tools, and it's simple as firing the NPM command  
  `npm install -g firebase-tools`
- Once installation is successful, you can re-confirm by firing the below command with version flag  
  `firebase --version //v10.2.0 in our case`
- Now, we need to login into the firebase account by firing the below command  
  `firebase login --interactive`

This will open up the default browser configured, and you sign up to your account against which firebase account/project is configured. Once logged in it will show Success Modal

![1.JPG](https://cdn.hashnode.com/res/hashnode/image/upload/v1644911895602/7wba_dJY9.jpeg?auto=compress,format&format=webp)

CLI will also show successful authentication for CLI to access the firebase account/project.

- We can now fire the firebase export command as below to export authentication data against our project of interest to CSV as below  
  `firebase auth:export auth_data.csv --format=csv --project <project-id>`

  **project-id** can be derived from the firebase console, under Project Overview and then Project Settings. **auth_data.csv** can be renamed with anything you want.

- If the command is successful, you will see something like this

  ```
  Exporting accounts to auth_data.csv
         Exported 50 account(s) successfully.
  ```

- Voila! Next time you need updated data, just execute Auth Export command.

### [Permalink](https://virendraoswal.com/export-firebase-authentication-data#heading-bonus "Permalink")Bonus

- If you want Auth data in JSON format, command changes to  
  `firebase auth:export auth_data.json --format=json --project <project-id>`

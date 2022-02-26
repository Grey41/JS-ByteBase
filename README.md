# JS-ByteBase
**JavaScript 2K Coding Challenge**

Welcome to JS-ByteBase.
Visit [js-bytebase.com](https://js-bytebase.com) to see the official website.
Please contact us at [hello@js-bytebase.com](mailto:hello@js-bytebase.com) if you have any questions.

To run JS-ByteBase on your local computer, install the required packages.

```
npm install
```

To generate the variables for the `.env` file, follow the instructions below.

```
APP_CONFIG = {"mongo": {
    "hostString": "The full MongoDB host string",
    "user": "The database username",
    "db": "The database name, usually the same as the username"
}}

SECRET = A random secret password
PASSWORD = Password for the email address
EMAIL = The email address itself
DATABASE = Password for the MongoDB database
HOST = Username of the host
```

Finally start the server with the following command.

```
node app.js
```

The server will listen as default on `localhost:5000`.

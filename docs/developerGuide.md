# Developer Guide

* [Setting Up](#setting-up)
* [Code Style](#code-style)
* [Design](#design)
* [API Endpoints](#api-endpoints)
* [Developer Tools](#developer-tools)
* [REST APIs](#rest-apis)

## Setting up
### Prerequisites

1. [**Node.js**](https://nodejs.org/en/download/)
2. A **code editor**. (We recommend [Visual Studio Code](https://code.visualstudio.com/))
3. [**MongoDB**](https://www.mongodb.com/download-center#community)

### Install dependencies
To install dependencies enter each project folder (`/backend-api` and `/frontend`) and run following command:
``` 
npm install
```

### Setup database server
Follow the instructions in this [online documentation](https://docs.mongodb.com/manual/administration/install-community/) to install the MongoDB server.

1. Start the MongoDB server.
2. Open the MongoDB console and create the database and collection:
   <br/>
   ```
   // create database
   use cs3219

   // create papers collection
   db.createCollection("papers", {collation: {locale: 'en', strength: 2}})
   ```
4. Import the datasets into the database.
5. Create indexes:
   <br/>
   ```
   // create indexes to improve query time
   db.papers.createIndex({venue: 1})
   db.papers.createIndex({"authors.name": 1})
   db.papers.createIndex({"year": 1})
   db.papers.createIndex({keyPhrases: 1})
   ```
### Run frontend server
To run frontend server, go to `/frontend` folder and execute:
```
npm start
```

### Run backend API server
To run backend API server, go to `/backend-api` folder and execute:
```
npm start
```

### Test
A quick test to check if the backend API server is to run:
`curl localhost:3000` or equivalent

## Code style
We are following closely to [Airbnb](https://github.com/airbnb/javascript) Javascript style but with a bit modification.

&ast; For Visual Studio Code, you can download an [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) from the marketplace.

## Design
Below is the architecture diagram of the whole solution for this project.

<img src="images/architecture.png" width="600"><br>

### CI/CD Process

<img src="images/ci_cd_process.png" width="600"><br>

## API Endpoints

| Method | Endpoint      | Get Params | Example |
| ------ | ------------- | ----- | ---- |
| GET | /trends/conference | venue, minYear, maxYear | /trends/conference?venue=arxiv&minYear1800&maxYear2017 |
| GET | /trends/keyphrase | phrase, minYear, maxYear | /trends/keyphrase?phrase=nlp&minYear1800&maxYear2017 |

## Developer Tools

* [insomnia](https://insomnia.rest/download/) - Rest client to inspect api calls

## REST APIs

**Get Top N X of Y**
----
  Returns the top N X of Y in JSON format.
  Top papers are counted by number of inCitations while the rest are counted by number of papers.

* **URL**

  /top-X-of-Y

* **Method:**

  `GET`
  
*  **URL Params**

   All Params are optional.
   'y' requires a 'value' and vice versa.
 
   `topN=[integer] default is 10` 
   `x=[string] paper(default) || author || venue || keyphrase || year` 
   `y=[string] title || author || venue || keyphrase || year` 
   `value=[string]` 

* **Success Response:**

  * **Code:** 200 <br />
    **Content:**
    `[{`
    `x : {xObj},`
    `count : 128,`
    `actualObjs : [{actualObj}, ..]`
    `}]`

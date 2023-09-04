# ntsk - Node Task
 Run tasks powered by Worker Threads in Node.js
## 📦Install
This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 16 or higher is required.
### npm
```console
$ npm i -s ntsk
```
### yarn
```console
$ yarn add ntsk
```
---
## Basic Usage
### 🟡JavaScript
```js
const { task } = require('ntsk');

async function main(){
  const valA = 1; // scope variables are not accessible from task execution context
  const valB = 2;
  const result = await task(
    { valA, valB }, // define args to send to task execution context
    // define function code, is recommended to use async to define task functions
    async (_, { valA, valB }) => { 
      return valA + valB;
    }
  );
  console.log(result); // 3
}
main();
```
### 🔵TypeScript
```ts
import { task } from 'ntsk';

type MyTaskArgs = {
    valA: number;
    valB: number;
};

async function main() : Promise<void>{
  const valA: number = 1; // scope variables are not accessible from task execution context
  const valB: number = 2;
  const result: number = await task(
    { valA, valB }, // you should get full type completion
    async (_, { valA, valB } : MyTaskArgs) => { 
      return valA + valB;
    }
  );
  console.log(result); // 3
}
main();
```
---
## Importing modules
It may be necessary to import modules in the task execution context, for this you can use the `require` function from the task execution context.
### 🟡JavaScript
```js
const { task } = require('ntsk');

async function main(){
  const valA = 1;
  const valB = 2;
  const result = await task(
    { valA, valB }, 
    // first argument is reserved for task execution context helpers
    async ({ require }, { valA, valB }) => { 
      const math = require('./math'); // import your own module at task execution context
      return math.sum(valA, valB);      
    }
  );
  console.log(result); // 3
}
main();
```

### 🔵TypeScript

```ts
import { task } from 'ntsk';

type MyTaskArgs = {
    valA: number;
    valB: number;
};

async function main() : Promise<void>{
  const valA: number = 1;
  const valB: number = 2;
  const result: number = await task(
    { valA, valB },
    // first argument is reserved for task execution context helpers
    async ({ require }, { valA, valB }) => { 
      const math = require('./math'); // import your own module at task execution context
      return math.sum(valA, valB);      
    }
  );
  console.log(result); // 3
}
main();
```
---
## Directory and File references
If you are running any file I/O operation chances are you want to keep as reference the `__dirname` and `__filename` variables of the script that triggered the task execution. These values are available through the task execution context.
### 🟡JavaScript
```js
const { task } = require('ntsk');

async function main(){
  console.log(__dirname); // /home/user/my-project/src
  console.log(__filename); // /home/user/my-project/src/index.js

  await task(null,     
    async ({ __filename, __dirname }) => { 
      console.log(__dirname); // /home/user/my-project/src
      console.log(__filename); // /home/user/my-project/src/index.js
    }
  );
}
main();
```
### 🔵TypeScript
```js
import { task } from 'ntsk';

async function main() : Promise<void>{
  console.log(__dirname); // /home/user/my-project/src
  console.log(__filename); // /home/user/my-project/src/index.js

  await task(null,     
    async ({ __filename, __dirname }) => { 
      console.log(__dirname); // /home/user/my-project/src
      console.log(__filename); // /home/user/my-project/src/index.js
    }
  );
}
main();
```
---
## 🔑License
[MIT](https://raw.githubusercontent.com/doriandres/ntsk/main/LICENSE)
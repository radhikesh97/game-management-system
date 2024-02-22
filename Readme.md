### Environment setup:
You need to install folloiwng:
1. Node.js Version:18.10.0
2. npm Version:9.6.3
3. npx Version:9.6.3

### Project Structure
1. node_modules:contains all the libraries and dependencies
2. public: contains the `.html` files for web pages. where the `index.html` is the initial page.
3. src: contains `.css` and `.js` source code for `.html` pages, and also `.test.js` test files for corresponding JavaScript file. Note that these test files should only be used for unit test and frontend module integration test.

### Command
1. Command `npm start` under the project directory to run the web-applaiction, which by default using port 3000 and can be accessed thorugh browser.
2. Command `npm test` under the project directory to lanuch Jest test runner
to run all `.test.js` test files under `src` directory. The document of Jest can be found [here](https://jestjs.io/docs/expect#content).

### Dependency
1. [Ant Design](https://ant.design/components/overview-cn/) (run `npm install antd` to install ant design package)
2. Ant Design incon library(run `npm install --save @ant-design/icons` to install incon library)
3. Axios(run `npm install axios` to install)
4. React-router-dom(run `npm install react-router-dom`)


### Page Routes
the route to each page
1. Home: `/`
2. Sign in page: `/signin`
3. Sign up page: `/signup`
4. Forgetpassword page: `/forgetpassword`
5. Changepassword page: `/changepassword`
6. User Profile page: `/userprofile`
7. About Us page: `/aboutus`
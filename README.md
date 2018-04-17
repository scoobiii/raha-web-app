## Develop locally

1. For Mac users, use [`homebrew`](https://brew.sh/) to [install `yarn`](https://yarnpkg.com/lang/en/docs/install/).
1. Run `yarn run use-test-config`.
1. Run `yarn start`.
1. Visit [http://localhost:3000/](http://localhost:3000/) to view local app.
1. Look at [`package.json`](package.json) `scripts` section for the other commands you can run, e.g. `yarn build`.
1. Get familiar with Firebase, React, and Typescript. Take a look at the [Create React App Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) - [VS Code Debugging](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#visual-studio-code) is nice. If using VS Code, recommended plugins include [Firebase](https://marketplace.visualstudio.com/items?itemName=toba.vsfire), [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome), and both [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [TSLint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) to automatically fix your style.
1. It is also helpful to install in your browser the [React](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) and [Redux](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) devtools extensions, to make it easier to inspect what's going on while you're making changes to the app.
1. Look at [`AppRouter.js`](src/components/AppRouter.js) for all of the main pages, visit/click around, and assign yourself an [issue](https://github.com/rahafoundation/raha.io/issues)!
1. To test locally install watchman using `brew install watchman` and run `yarn test`.
1. After logging in to the test db for the first time, you will be taken to [http://localhost:3000/invite_missing](http://localhost:3000/invite_missing) because your authentication uid is different. To fix this see (edit your test uid)[https://github.com/rahafoundation/firebase-backup#edit-your-personal-test-uid].

## Deploy

1. `yarn run use-prod-config`
1. `yarn build` # Bundle everything for production
1. `serve -s build` # Test out on both web and mobile
1. `firebase deploy --project <project-id>` # Deploy everything

### Firebase Rules

1. `firebase deploy --project <project-id> --only firestore:rules`

### Firebase Functions

1. `firebase deploy --project <project-id> --only functions`

<h3 align="center">Bring your applications 6 times faster to market</h3>

<p align="center">By building, running, and scaling them with <a href="https://cody.build" target="_blank">Cody</a><br>the Cloud Native PaaS platform, designed for DevOps teams</p>

<br>

<p align="center">
  <a href="https://cody.build" target="_blank">
    <img src="https://cody.build/img/scenes/solution.svg" width="700px" alt="Cody" />
  </a>
</p>

# Serverless Service Templates

This repository contains the Serverless Service Templates for [Cody](https://cody.build).

## Testing

The JavaScript Testing framework [Jest](https://jestjs.io/) is used to provide an easy way to test the correctness of the service templates.

In order to test a service template, you can add a `tests/test.ts` file to the directory of the service template. You can then add your testing logic to make sure that the service template is syntactically correct and works as expected.

To run the tests, you first need to install the npm dependencies of the tests:

```
yarn
```

Then run the tests of the specific template:

```
yarn test templates/<template>
```

Or run the tests of all the templates at once:

```
yarn test
```

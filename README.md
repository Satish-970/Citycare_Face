# Products

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Backend connection

All frontend API calls use `environment.apiUrl`, which is generated before production builds.

Local development defaults to:

```bash
http://localhost:7070
```

For Vercel or another static host, set one of these build environment variables to your Railway API Gateway URL:

```bash
VITE_API_BASE_URL=https://your-api-gateway.up.railway.app
```

Alternative names supported by the build script are `NG_APP_API_BASE_URL` and `API_BASE_URL`.

In Railway, set `CORS_ALLOWED_ORIGINS` on the `ApiGateway` service to your deployed frontend URL, for example:

```bash
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

Do not point the frontend at each individual backend service. Point it only at the Railway `ApiGateway` URL.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# Pomodoro Timer

A minimal pomodoro timer to study with.

## Development

### Setup the project

After cloning the repo, cd into it and install the dependencies:

```bash
npm ci
```

To run the project in dev mode:

```bash
npm run dev
```

The project is now running at [http://localhost:5173](http://localhost:5173)

---

Or to build the prod version:

```bash
npm run build
```

And then to run the built version:

```bash
npm run preview
```

The project is now running at [http://localhost:4173](http://localhost:4173)

### Setup with docker

For the adventurous, there is also a docker setup.

Assuming you have installed `docker` and `docker-compose`:

To build and run the dev version:

```bash
npm run docker:dev-up

# and to stop the container
npm run docker:dev-down
```

To build and run the prod version:

```bash
npm run docker:prod-up

# and to stop the container
npm run docker:prod-down
```

For more see the `package.json` scripts.

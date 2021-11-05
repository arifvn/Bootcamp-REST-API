# BOOTCAMP REST API - DEVCAMPER 🌱

> Backend REST API for DevCamper Application

Rename `"src/config/config.env.env"` to `"config/config.env"` and update the values/settings to your own

## Install Dependencies

```bash
npm install
```

## Run App

```bash
# Run in dev mode
npm run dev

# Run in prod mode
npm start
```

## Database Seeder

To seed the database with users, bootcamps, courses and reviews with data from the "\_data" folder, run

```bash
# Destroy all data
node seeder -d

# Destroy certain Model
node seeder -d Course

# Import all data
node seeder -i
```

## Source & Copyright

- [Brad Traversy](https://www.udemy.com/course/nodejs-api-masterclass/)

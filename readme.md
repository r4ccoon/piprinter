# pi-printer

## About

Pi Printer is a minimal thermal printer server for orange-pi or raspberry-pi or any other SCB compatible board.
Background story: we have setup a POS software that connects to a thermal printer via bluetooth. once we got to use it in a real location, e.g. in a shopping mall, we found that there are 20 bluetooth printer/devices around us, and we have difficulties on picking one. and once we connected to the correct printer, we have difficulties on maintaining the connection. thus we come up with a reliable old way of "wired" connection.

## How it works

a serverless backend that stores the print jobs. this serverless is hosted in mongodb-atlas, with mongodb-stitch as the serverless functions. the thermal printer is connected to a rasp-pi/orange-pi via USB. this pi-device is connected to the internet via wi-fi,
and then the nodejs codes that are deployed in pi-device is the client, which manages print jobs, e.g. pull the jobs, print it, and "removing" the print job.

on another side of it, there is your web app/app that has something that you want to print.(e.g. POS software, ios/android app, etc).
this App will send POST request to the serverless backend.
this request,then will be stored in the backend, and the printer server will check the updates every 3 seconds and print it if there's any new jobs that still has not been printed.

## Pre-requisites

1. SCB (raspberry compatible) e.g orangepi etc. this codes is tested on orangepi zero, using Armbian
2. in the Pi, you have to have `git, node, yarn, npm`
3. bluetooth thermal printer with mini-usb/usb connection.

## Steps

1. create mongodb atlas account here https://www.mongodb.com/cloud/atlas
2. set up a free cluster
3. create mongo-stitch app, set up a webhook for your app/web app to send print job to.
4. set up functions and webhooks for your thermal printer/raspberry-pi/orange-pi to pull print jobs and for the webapp/print job sender
5. set up sentry account for error monitoring
6. set up pm2 account for orange pi monitoring
7. run the print server

## Step Explanations

### 1 create mongodb atlas account

create mongodb atlas account here https://www.mongodb.com/cloud/atlas
it has to be mongodb atlas because we are depending on mongo-stitch.

### 2 create free mongodb cluster

once you created an account there, you are allowed to create 1 free mongo-db cluster.
so now, create it. put it in a region close to where your printer is located.

### 3 create stitch app

once you created the cluster,

- go to `Services -> stitch`
- `create new application`,
- give it app name, link to your created cluster, name the service.
- select `local` deployment model.
- select primary region, pick the same/closest to where you setup your cluster.

### 4 configure stitch app

once the application is created, click on it, and you go to the `stitch` dashboard.

- take note your `APP ID`
- initialise a mongoDB collection. fill in Database name with `printer` and Collection name `jobs`
- create rules, pick your database, and collection, make sure that you have `write` access

#### 4.1 Create users (API users from API user providers)

- you need to create 2 different users, 1 for the webapp/the one who sending in printer jobs. and the 2nd is for the orange-pi.
- go to `providers` tab, click on API Keys.
- enable it, if not enabled yet.
- click `create api key`
- name the 1st one, `printer` take note the key, prepare it for the orange-pi
- click `create api key` again to create the 2nd one.
- name the 2nd one, e.g. `web_app` take note the key, prepare it for your web-app/print job sender.

#### 4.2 Create getQueues Functions

- `functions` is a serverless API/RPC where you can call from the client with the `stitch-sdk`
- go to `functions` -> create new function -> name it `getQueues`
- authentication `application authentication`
- make sure `private` is disabled
- go to `function editor` and paste in content from your repo `stitch/function/getQueues.js`

#### 4.3 Create setIsPrinted Functions

- go to `functions` -> create new function -> name it setIsPrinted
- authentication `application authentication`
- make sure `private` is disabled
- go to `function editor` and paste in content from your repo `stitch/function/setIsPrinted.js`

#### 4.4 Create print-service Webhook

Webhook is a public facing API or a https based serverless API. your web app/print job sender supposed to be able to
send POST request to this webhook as a way to send the print job.

- go to `3rd party service` -> `add incoming webhook`
- name it `add-print-job`
- authentication `application authentication`
- take note the `Webhook Url`
- set HTTP method to `POST`
- `respond with result` to `ON`
- `request validation` can be `No additional authorization`
- go to `function editor` and paste in content from `stitch/webhook/add-print-job.js`

#### 4.5 Deploy

once you saved all of those, don't forget to press `deploy` on the top of the window.

### 5 setup sentry account

we are using sentry as one of the transport of our logger. the printer server will be placed remotely thus we need a little bit of visibility in term of when there's error/exception on our printer server.

- please go to https://sentry.io/ and create a free account, and login.
- take note the `sentry dsn`

### 6 setup pm2 in the printer server (orange-pi)

- register an account https://id.keymetrics.io/api/oauth/register
- login, then add new bucket.
- on top right, you see `connect` button, take note the `linking command` to link your printer to this monitoring tool.
  `pm2 link xx5522 xx1234`

### 7 run the printer server

- connect the thermal printer via mini-usb to usb part of orange-pi/raspberry-pi. in my case,
  the usb device assigned is `/dev/usb/lp0`
  reference: https://mike42.me/blog/2015-03-getting-a-usb-receipt-printer-working-on-linux
- ssh to your orange-pi/raspberry pi, `git clone` this repo from there.
- make sure you have `node, npm, yarn` in your orange-pi/raspberry-pi
- install pm2. `npm install -g pm2`
- paste the `linking command` and execute it.
- `yarn install`
- setup `.env` file as your config file.
  `cp .env.dist .env`
  now copy paste your keys/dsn that you noted above into this `.env` file.

- run the printer server with pm2. `pm2 start main.js`
- save the task to pm2 service manager. `pm2 save`
- orange-pi/raspberry-pi are devices that easily restartable, and difficult to connect to, so we can set it up as a startup script. `pm2 startup`, copy the response, and paste and execute in the terminal.
  when there's error at a later point of the running time, you can just unplug the power, then replug it.

# WebApp/printer client/print job sender

this is a client / software that sends print job to the printer server.
thanks to the webhook that we set above, we can just send a POST request to it, and once it received by the mongodb-stitch, your printer server will print it straight away.

```
example request
POST
https://ap-southeast-2.aws.webhooks.mongodb-stitch.com/api/client/v2.0/app/printer-abcd/service/printer-service/incoming_webhook/add-print-job

body:

{
  "api-key": "api-key-secret-akn20380-1--2980020",
  "jobContent": "print this"
}

```

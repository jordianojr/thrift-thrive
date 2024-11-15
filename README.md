# thrift-thrive

An all in one platform for thrift and fashion, encouraging thrifting culture through marketplaces, editorials and an interactable map showing upcoming thrifting events. This platform caters to both buyers and sellers of fashion.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Warning](#warning)

## Description

In response to a growing demand for conscious consumerism and sustainable fashion choices, there is an opportunity for a platform that offers a:

- Marketplace: that facilitates buying and selling of second hand clothing items.
- Editorial page: that promotes exchange of sustainable fashion practices within the community.
- Informative map: that provides information on clothing pop ups, flea markets etc.

## Web Deployed Version

Below is the deployed link of this application: 
https://thriftthrive-a28e7.web.app/

## GitHub Repo Link 

https://github.com/jordianojr/thrift-thrive

## Installation

Ensure that you have downloaded and installed node.js and npm to run this application. 

You may refer to this link if you are unsure:
https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

Go on your IDE and in the terminal run each line separately:

```console
git clone https://github.com/jordianojr/thrift-thrive
```
```console
cd thrift-thrive/my-app
```
```console
npm install
```
```console
npm start
```

You should be able to view this application on localhost:5173

## Test User Credentials

**Normal user account:**  
Email: john@gmail.com  
Password: 123456  

---

**Admin account:**  
Email: thriftthrive@gmail.com  
Password: 123456  

---

**StripeAPI Payment Card**  

**For success cases:**  
Email: **any**  
Card number: 4242 4242 4242 4242  
MM/YY: **any**  
CVC: **any**  
Name: **any**  

**For decline cases:**  
Email: **any**  
Card number: 4000 0000 0000 0002  
MM/YY: **any**  
CVC: **any**  
Name: **any**  

## Warning

Using StripeAPI and completing/refusing a transaction will lead you to our cloud deployed app as StripeAPI is hosted on Firebase Cloud Functions as it requires https:// to run.

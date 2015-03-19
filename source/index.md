---
title: Yellow API Reference

language_tabs:
  - shell: curl
  - python: Python
  - javascript: Node/JS


toc_footers:
  - <a href='#'>Sign Up for an API Key/Secret</a>

search: true
---
# Introduction
Welcome to YellowPay! We're here to take the pain out of integrating bitcoin into your web & mobile applications. This documentation will give you all the information you need to get set up with whatever language you're comfortable with, or even better, through raw HTTP.

If you ever need any help, feel free to contact us at support@yellowpay.co

## Bitcoin Payments in a Nutshell

There are 5 steps in a Bitcoin payment:

1. The **customer** completes their shopping cart on the **merchant**’s site and proceeds to check out
2. **Yellow** generates a unique, one-time-use Bitcoin address to accept payment which is then displayed on the **merchant**’s site. The address is displayed both in text and QR-code form.
3. **The customer** sends payment (in Bitcoin) to the Bitcoin address, using either:
    * Their smartphone Bitcoin wallet to scan the QR-code, or
    * A web based Bitcoin wallet (e.g., blockchain.info)
4. Bitcon payment is received and **the customer** is redirected to an order confirmation page on **the merchant’s** site
5. **Yellow** converts the received Bitcoin payment into a national currency (like AED) and transfers it to **the merchant’s** bank account

For an overview of how control flows between customer, merchant, and Yellow, please see this [flowchart](https://drive.google.com/a/yellowpay.co/file/d/0B7kRiTGQ3IwNdFBDcXlqNkMwWU0/view).

For more information on the Bitcoin technology, please see [shubitcoin.com](http://shubitcoin.com) - which will be home to a number of great Bitcoin resources created especially for the Middle East.

## Adding Bitcoin to a Shopping Cart
There are three ways to integrate Yellow Bitcoin payments with a shopping cart:

1. By using a plugin to one of our supported ecommerce platforms like Magento
2. By using one of our SDKs (PHP, Python, Ruby & Node.js)
3. By accessing our API directly from the merchant site

# Authentication
All API requests must be authenticated with the merchant’s private key. To secure communication between merchant server and Yellow server we use a form of [HMAC authentication](http://en.wikipedia.org/wiki/Hash-based_message_authentication_code).

When submitting a request to Yellow 3 additional header elements are needed:

* **API-Key:** your public API key, you can get this from your merchant dashboard
* **API-Nonce:** an ever-increasing number that is different for each request (e.g., current UNIX time in milliseconds)
* **API-Sign:** an HMAC hash (using SHA256) signed with your API secret and converted to hexadecimal. The message to be hashed and signed is the concatenation of the nonce, fully-qualified request URL, and the json encoded POST data (for GET requests, the “POST data” is an empty string).

This approach allows us to authenticate the request as coming from the merchant, prevents anyone else from modifying or replaying the request, and ensures the secret key is never exposed (even in a Heartbleed-type scenario where the SSL layer itself is compromised).

If you need a more concrete example in your favorite language, feel free to check out the source code of one of our SDKs. However, if you don't wanna worry about authentication, you could just use one of our SDKs directly.

# The Yellow API
There are two steps in integrating the Yellow API (corresponding to steps #2 and #4 in the Bitcoin payments walkthrough above)

1. **Create an invoice:** the merchant provides a national currency price (e.g., 100 AED) and receives an invoice. The invoice bundles together a unique, one-time-use Bitcoin address and a Bitcoin price equivalent to the provided national currency price.
2. **Await and respond to payment notifications:** There are two ways a merchant can listen to payment status  notifications from Yellow: either through a JavaScript “postMessage” notification, or through registering an “Instant Payment Notification” (IPN) callback URL when creating the invoice.


## Server Root
Direct all your API calls to our production server at:

<aside class="notice">
Production: https://api.yellowpay.co
</aside>


## Creating Invoices
To create an invoice the merchant POSTs to /v1/invoice. This is a server-side, authenticated call.

<aside class="notice">
POST /v1/invoice/ (server-side)
</aside>

```shell
curl https://api.yellowpay.co/v1/invoice/
  -X POST
  -H "Content-Type: application/json"
  -H "API-Key: Eo2XE5SrHcJVdqK9uIDU"
  -H "API-Nonce: 1426625830520"
  -H "API-Sign: 4a54add6f67sec8e991dc6433c9e0318fvdf1b2cf02ffca78d14804be6f53dca"
  -d '{
      "base_ccy":"USD",
      "base_price":"0.05",
      "callback":"http://yourserver.com/callback-url/"
      }'
```

```python
import json
import yellow


# You can get your api key/secret from your merchant dashboard.
# Store API Key/Secret in environment variable for better security
api_key = "Eo2XE5SrHcJVdqK9uIDU"
api_secret = "73jnZflRHpGReqFxzwF_JtynRNmZXoQspPaxTtsy"

# Required: A 3-letter currency code
base_ccy = "USD"

# Required: The invoice price in the above currency
base_price = "0.05"

# Optional: URL for Yellow to POST to as a callback
callback = "http://yourserver.com/callback-url/"

created_invoice = yellow.create_invoice(api_key, api_secret, base_ccy, base_price, callback)

# Print the result beautifully!
print json.dumps(created_invoice.json(), sort_keys=True, indent=4)

```


```javascript
var yellow = require('yellow-sdk-node');

// Store your API Key/Secret in environment variable for better security
var api_key = 'Eo2XE5SrHcJVdqK9uIDU',
    api_secret = '73jnZflRHpGReqFxzwF_JtynRNmZXoQspPaxTtsy',
    base_ccy = 'USD',
    base_price = '0.05',
    callback = 'http://yourserver.com/callback-url/'; // Optional

yellow.createInvoice(api_key, api_secret, base_ccy, base_price, callback, function(error, response, body){
    if (!error && response.statusCode == 200) {

        //print the result beautifully
        console.log(JSON.stringify(body, null, 4));
    } else if(error) {
      console.log(error)
    }

});

```

### Request Parameters (JSON encoded body data)
Parameter | Type | Description
-------------- | -------------- | --------------
base_ccy  | string | **required** - a 3-letter currency code (e.g. “AED”) representing the national currency used by the merchant.
base_price | string | **required** - The invoice price in the national currency (e.g. “20”)
callback | string | **optional** - A URL monitored by the merchant. Yellow will POST invoice status updates to this URL (i.e. Instant Payment Notifications or IPN). The status updates are posted as urlencoded parameters and contains the same fields as the GET query response below.

<aside class="notice">
NOTE: for now all invoices must be at least $0.05 USD or roughly $0.18 AED
</aside>

### Response Parameters (JSON encoded body data)
Parameter | Type | Description
-------------- | -------------- | --------------
id  | string | the invoice ID - this will be used when querying the invoice status
url | string | a URL (hosted on Yellow’s servers) where the invoice can be viewed. This page is designed to be embedded via IFRAME in a merchant shopping cart.
address | string |  a unique, one-time-use Bitcoin address. The customer will make payment to this address.
invoice_ccy | string | The currency which the customer will pay in. For now it is always “BTC” invoice_price: The price, in “BTC”, that the customer must pay. This is the BTC equivalent of the provided base_price
base_ccy | string | a 3-letter currency code (e.g. “AED”) representing the national currency used by the merchant. (This will be the same value that was POSTed when creating the invoice)
base_price  | string | The invoice price in the national currency (e.g. “20”). (This will be the same value that was POSTed when creating the invoice)
server_time  | string |  current time (in UTC) on the server
expiration  | string | time (in UTC) when the invoice expires and is no longer valid (roughly 10 minutes after invoice is created)


## Querying Invoices
To query the status of an invoice the merchant GETs /v1/invoice/[id]/ where [id] is the invoice ID returned when creating the invoice.

<aside class="notice">
GET /v1/invoice/[id]/
</aside>

```shell
curl https://api.yellowpay.co/v1/invoice/a7dfbfbf69b7b0sacb2dadw5e7437754/
  -X GET
  -H "API-Key: Eo2XE5SrHcJVdqK9uIDU"
  -H "API-Nonce: 1426625830520"
  -H "API-Sign: 4a54add6f67sec8e991dc6433c9e0318fvdf1b2cf02ffca78d14804be6f53dca"
```

```python
import json
import yellow


# You can get your api key/secret from your merchant dashboard.
# Store API Key/Secret in environment variable for better security
api_key = "Eo2XE5SrHcJVdqK9uIDU"
api_secret = "73jnZflRHpGReqFxzwF_JtynRNmZXoQspPaxTtsy"

# invoice ID you received when you created the invoice.
invoice_id = "a7dfbfbf69b7b0sacb2dadw5e7437754"

invoice = yellow.query_invoice(api_key, api_secret, invoice_id)

# Print the result beautifully!
print json.dumps(invoice.json(), sort_keys=True, indent=4)
```

```javascript
var yellow = require('yellow-sdk-node');

// Store your API Key/Secret in environment variable for better security
var api_key = 'Eo2XE5SrHcJVdqK9uIDU';
var api_secret = '73jnZflRHpGReqFxzwF_JtynRNmZXoQspPaxTtsy';

// Invoice ID you got when you first created the invoice
var invoice_id = 'a7dfbfbf69b7b0sacb2dadw5e7437754';

yellow.queryInvoice(api_key, api_secret, invoice_id, function(error, response, body){
    if (!error && response.statusCode == 200) {
        //print the result beautifully
        console.log(JSON.stringify(body, null, 4));
    } else if(error) {
      console.log(error)
    }

});
```

### Response Parameters (JSON encoded body data)
Parameter | Type | Description
-------------- | -------------- | --------------
id  | string | the invoice ID - this will be used when querying the invoice status
url | string | a URL (hosted on Yellow’s servers) where the invoice can be viewed. This page is designed to be embedded via IFRAME in a merchant shopping cart.
address | string |  a unique, one-time-use Bitcoin address. The customer will make payment to this address.
invoice_ccy | string | The currency which the customer will pay in. For now it is always “BTC” invoice_price: The price, in “BTC”, that the customer must pay. This is the BTC equivalent of the provided base_price
base_ccy | string | a 3-letter currency code (e.g. “AED”) representing the national currency used by the merchant. (This will be the same value that was POSTed when creating the invoice)
base_price  | string | The invoice price in the national currency (e.g. “20”). (This will be the same value that was POSTed when creating the invoice)
server_time  | string |  current time (in UTC) on the server
expiration  | string | time (in UTC) when the invoice expires and is no longer valid (roughly 10 minutes after invoice is created)


## Instant Payment Notifications (IPN)
Whenever an invoice status changes the Yellow server will POST to the provided IPN URL. The payload of the POST request will contain the same information (JSON-encoded) as the GET  response of querying an invoice. Namely:

```shell
Verifying IPN is a helper function. Not available for curl.
Please choose a language from the tab above.
```

```python
import json
import yellow

api_secret = "73jnZflRHpGReqFxzwF_JtynRNmZXoQspPaxTtsy"

# The URL you set as a "callback" when you created the invoice
host_url = "http://yourserver.com/callback-url/"

# Returns a boolean.
is_verified = yellow.verify_ipn(api_secret, host_url, request)
```

```javascript
var yellow = require('yellow-sdk-node');

var api_secret = "73jnZflRHpGReqFxzwF_JtynRNmZXoQspPaxTtsy"

// The URL you set as a "callback" when you created the invoice
var host_url = "http://yourserver.com/callback-url/"

// Returns a boolean.
isVerified = yellow.verifyIPN(api_secret, host_url, request)
```

Parameter | Type | Description
-------------- | -------------- | --------------
id  | string | the invoice ID - this will be used when querying the invoice status
url | string | a URL (hosted on Yellow’s servers) where the invoice can be viewed. This page is designed to be embedded via IFRAME in a merchant shopping cart.
address | string |  a unique, one-time-use Bitcoin address. The customer will make payment to this address.
invoice_ccy | string | The currency which the customer will pay in. For now it is always “BTC” invoice_price: The price, in “BTC”, that the customer must pay. This is the BTC equivalent of the provided base_price
base_ccy | string | a 3-letter currency code (e.g. “AED”) representing the national currency used by the merchant. (This will be the same value that was POSTed when creating the invoice)
base_price  | string | The invoice price in the national currency (e.g. “20”). (This will be the same value that was POSTed when creating the invoice)
server_time  | string |  current time (in UTC) on the server
expiration  | string | time (in UTC) when the invoice expires and is no longer valid (roughly 10 minutes after invoice is created)


All IPN requests are authenticated as described above, the merchant should verify the signature to ensure the IPN came from Yellow. You'll find examples on the right, but remember that the `verify_ipn` function works within the context of a web app (since it expects a request parameter). We have example demos in your favorite language to make it all clear for you.



Once you have received and processed the IPN, Yellow expects a 200 response. If Yellow doesn’t see a 200 response it will try the IPN again. Yellow will retry 10 times at a gradually reduced frequency.

## JavaScript postMessage
In addition to the redirect URL, the widget can communicate with the merchant webpage via postMessage (a cross-domain compatible way to communicate - more info [here](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)). When payment is detected the widget will issue a postMessage to the parent page. See an example in the code area on the right.


```javascript
function invoiceListener(event) {
        // For additional security, confirm the message originated from the
        // embedded invoice
        if (!/\.yellowpay\.co$/.test(event.origin)) {
          alert("Received message from unexpected domain: " + event.origin);
          return;
        }
        // Handle the invoice status update
        console.log(event.data);
      }
      // Attach the message listener
      if (window.addEventListener) {
        addEventListener("message", invoiceListener, false)
      } else {
        attachEvent("onmessage", invoiceListener)
}
```
# Note on Invoice Status

After the customer sends a payment it passes through two states: **authorizing** and **paid**. Authorizing means that we have detected the payment and it is in the process of being verified by the Bitcoin network. We will mark an invoice **paid** once we’ve been able to authenticate the payment.

We can usually detect an **authorizing** payment within seconds, however it can take anywhere from 5-40 minutes to authenticate the payment and mark the invoice **paid**. Shipping product before a payment has been authenticated carries minimal risk. However, it is theoretically possible that the payment will turn out to be fraudulent (an authorized payment that is never authenticated), in which case Yellow will not be able to settle payment to the merchant. This can be considered similar to when a customer pays for product with a credit card and then issues a card-not-present chargeback.

The risk of such "Bitcoin chargeback" is quite low, especially for small purchases (technically, this requires the user to have a very large amount of computing power directed at the Bitcoin network to perform a malicious transaction). Therefore, we recommend merchants allow a customer to complete the checkout process as soon as the invoice is marked **authorizing**. However, for risk mitigation, we suggest that the shipping of any high-priced products be delayed until the invoice is marked **paid** (i.e. we suggest waiting at least 5-40 minutes before shipping the product).

# htmx transfer encoding chunked extension

This extension adds chunked transfer encoding to htmx 2.x requests. \following bigskysoftware/htmx#1911

The code is heavily inspired by this existing extension, which only works with htmx 1.x:
https://github.com/douglasduteil/htmx.ext...chunked-transfer

## Install

```html
<script src="https://unpkg.com/htmx-ext-sse@2.2.2/sse.js"></script>
```

## Usage

```html
  <div hx-ext="sse" sse-connect="/chatroom" sse-swap="message">
      Contents of this box will be updated in real time
      with every SSE message received from the chatroom.
  </div>
```

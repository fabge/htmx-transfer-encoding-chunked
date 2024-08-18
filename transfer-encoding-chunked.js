/*
Chunked Transfer Extension
==========================
This extension adds support for chunked transfer encoding to htmx.
*/

(function(){
    /** @type {import("../htmx").HtmxInternalApi} */
    var api;

    htmx.defineExtension('chunked-transfer', {
      init: function(apiRef) {
        api = apiRef;
      },

      onEvent: function(name, evt) {
        if (name === "htmx:beforeRequest") {
          var xhr = evt.detail.xhr;
          var elt = evt.detail.elt;

          xhr.onprogress = function() {
            var isChunked = xhr.getResponseHeader("Transfer-Encoding") === "chunked";

            if (!isChunked) return;

            var response = xhr.response;

            api.withExtensions(elt, function(extension) {
              if (extension.transformResponse) {
                response = extension.transformResponse(response, xhr, elt);
              }
            });

            var swapSpec = api.getSwapSpecification(elt);
            var target = api.getTarget(elt);

            htmx.swap(target, response, {
              swapStyle: swapSpec.swapStyle,
              swapDelay: swapSpec.swapDelay,
              settleDelay: swapSpec.settleDelay,
              ignoreTitle: true,
              contextElement: elt
            });
          };
        }
      }
    });
  })();

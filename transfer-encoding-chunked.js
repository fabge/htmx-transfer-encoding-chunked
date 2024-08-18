(function(){
  /** @type {import("../htmx").HtmxInternalApi} */
  var api;
  var lastResponseLength = 0;
  var isComplete = false;

  htmx.defineExtension('chunked-transfer', {
      init: function(apiRef) {
          api = apiRef;
      },

      onEvent: function(name, evt) {
          if (name === "htmx:beforeRequest") {
              var xhr = evt.detail.xhr;
              var elt = evt.detail.elt;

              isComplete = false;

              xhr.onprogress = function() {
                  if (isComplete) return;

                  var isChunked = xhr.getResponseHeader("Transfer-Encoding") === "chunked";
                  if (!isChunked) return;

                  var response = xhr.response;
                  var newChunk = response.substring(lastResponseLength);
                  lastResponseLength = response.length;

                  if (newChunk.trim() === "") return;

                  api.withExtensions(elt, function(extension) {
                      if (extension.transformResponse) {
                          newChunk = extension.transformResponse(newChunk, xhr, elt);
                      }
                  });

                  var swapSpec = api.getSwapSpecification(elt);
                  var target = api.getTarget(elt);

                  htmx.swap(target, newChunk, {
                      swapStyle: swapSpec.swapStyle,
                      swapDelay: swapSpec.swapDelay,
                      settleDelay: swapSpec.settleDelay,
                      ignoreTitle: true,
                      appendOnly: true,
                      contextElement: elt
                  });
              };

              xhr.onload = function() {
                  isComplete = true;
              };

              xhr.onloadend = function() {
                  lastResponseLength = 0;
                  isComplete = false;
              };
          }
      }
  });
})();

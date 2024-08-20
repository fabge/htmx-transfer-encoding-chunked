(function () {
    /** @type {import("../htmx").HtmxInternalApi} */
    var api;
    var accumulatedResponse = '';

    htmx.defineExtension('chunked-transfer', {
        init: function (apiRef) {
            api = apiRef;
        },

        onEvent: function (name, evt) {
            if (name === "htmx:beforeRequest") {
                var xhr = evt.detail.xhr;
                var elt = evt.detail.elt;

                xhr.onprogress = function () {
                    var isChunked = xhr.getResponseHeader("Transfer-Encoding") === "chunked" ||
                        xhr.getResponseHeader("X-Transfer-Encoding") === "chunked";
                    if (!isChunked) return;

                    var response = xhr.response;
                    var newChunk = response.substring(accumulatedResponse.length);

                    if (newChunk.trim() === "") return;

                    accumulatedResponse += newChunk;

                    api.withExtensions(elt, function (extension) {
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
                        appendOnly: true
                    });
                };

                xhr.onloadend = function () {
                    accumulatedResponse = '';
                };

                evt.detail.shouldSwap = false;
            }
        }
    });
})();

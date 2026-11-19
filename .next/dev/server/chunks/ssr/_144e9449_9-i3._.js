module.exports = [
"[project]/app/components/AutocompleteWidget.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const emptyAddress = {
    address1: "",
    address2: "",
    locality: "",
    state: "",
    postcode: "",
    country: ""
};
// The rest of the form. address1 is the search box and is rendered separately.
const otherFields = [
    {
        name: "address2",
        label: "Apartment, unit, suite, or floor #"
    },
    {
        name: "locality",
        label: "City"
    },
    {
        name: "state",
        label: "State/Province"
    },
    {
        name: "postcode",
        label: "Postal code"
    },
    {
        name: "country",
        label: "Country/Region"
    }
];
const labelClass = "block mb-1 text-xs font-bold uppercase tracking-wide text-gray-700";
const inputClass = "block w-full rounded bg-gray-200 px-4 py-3 text-gray-700 focus:bg-white focus:outline-none";
const AutocompleteWidget = ()=>{
    const [address, setAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(emptyAddress);
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [suggestions, setSuggestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const address2Ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Search 300ms after the user stops typing, so we don't send a request on every keystroke.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (query.trim().length < 3) {
            setSuggestions([]);
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(async ()=>{
            const params = new URLSearchParams({
                text: query,
                format: "json",
                limit: "5",
                apiKey: ("TURBOPACK compile-time value", "f163217a66044c26839d63ad46175698")
            });
            try {
                const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`, {
                    signal: controller.signal
                });
                const data = await res.json();
                setSuggestions(data.results ?? []);
            } catch (err) {
                if (err.name !== "AbortError") console.error(err);
            }
        }, 300);
        // If the user types again, cancel the pending search.
        return ()=>{
            clearTimeout(timer);
            controller.abort();
        };
    }, [
        query
    ]);
    const handleChange = (e)=>{
        const { name, value } = e.target;
        setAddress({
            ...address,
            [name]: value
        });
        if (name === "address1") setQuery(value);
    };
    const selectSuggestion = (result)=>{
        setAddress({
            address1: [
                result.housenumber,
                result.street
            ].filter(Boolean).join(" "),
            address2: "",
            locality: result.city ?? "",
            state: result.state_code ?? result.state ?? "",
            postcode: result.postcode ?? "",
            country: result.country ?? ""
        });
        setQuery("");
        address2Ref.current?.focus();
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        console.log(address);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full max-w-lg space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "address1",
                        className: labelClass,
                        children: "Address"
                    }, void 0, false, {
                        fileName: "[project]/app/components/AutocompleteWidget.js",
                        lineNumber: 92,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "address1",
                        name: "address1",
                        autoComplete: "off",
                        placeholder: "Start typing an address...",
                        value: address.address1,
                        onChange: handleChange,
                        onBlur: ()=>setSuggestions([]),
                        className: inputClass
                    }, void 0, false, {
                        fileName: "[project]/app/components/AutocompleteWidget.js",
                        lineNumber: 93,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    suggestions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "absolute z-10 mt-1 w-full overflow-hidden rounded border border-gray-200 bg-white shadow",
                        children: suggestions.map((result)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    // onMouseDown runs before the input's onBlur, so the list doesn't close before the click registers
                                    onMouseDown: (e)=>{
                                        e.preventDefault();
                                        selectSuggestion(result);
                                    },
                                    className: "block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer",
                                    children: result.formatted
                                }, void 0, false, {
                                    fileName: "[project]/app/components/AutocompleteWidget.js",
                                    lineNumber: 107,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            }, result.place_id, false, {
                                fileName: "[project]/app/components/AutocompleteWidget.js",
                                lineNumber: 106,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/app/components/AutocompleteWidget.js",
                        lineNumber: 104,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/AutocompleteWidget.js",
                lineNumber: 91,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            otherFields.map(({ name, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            htmlFor: name,
                            className: labelClass,
                            children: label
                        }, void 0, false, {
                            fileName: "[project]/app/components/AutocompleteWidget.js",
                            lineNumber: 126,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            id: name,
                            name: name,
                            ref: name === "address2" ? address2Ref : undefined,
                            value: address[name],
                            onChange: handleChange,
                            className: inputClass
                        }, void 0, false, {
                            fileName: "[project]/app/components/AutocompleteWidget.js",
                            lineNumber: 127,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, name, true, {
                    fileName: "[project]/app/components/AutocompleteWidget.js",
                    lineNumber: 125,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)))
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/AutocompleteWidget.js",
        lineNumber: 90,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = AutocompleteWidget;
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_144e9449_9-i3._.js.map
export const AEM_STORE = {
    environments: [
        { id: "dev", value: "Development" },
        { id: "stage", value: "Stage" },
        { id: "prod", value: "Production" },
    ],
    selectedEnvDetails: {
        tenant: "EW",
        env: "dev",
        selector: "/content/nl-energiewacht-com/nl_NL",
        baseUrl: "https://dev-www.energiewacht.nl",
    },
    selectedEnvironment: "dev",
    availableTenants: [
        {
            id: "EW",
            value: "Energiewacht",
            domain: "energiewacht.nl",
            selector: "/content/nl-energiewacht-com/nl_NL",
        },
        {
            id: "EWW",
            value: "Energiewacht West",
            domain: "energiewachtwest.nl",
            selector: "/content/nl-energiewachtwest-com/nl_NL",
        },
        {
            id: "VOLNXT",
            value: "Volta NXT",
            domain: "voltanxt.nl",
            selector: "/content/nl-voltanxt-com/nl_NL",
        },
        {
            id: "NLI",
            value: "Nederland Isoleert",
            domain: "nederlandisoleert.nl",
            selector: "/content/nl-nederlandisoleert-com/nl_NL",
        },
        {
            id: "KLI",
            value: "Klimaatroute",
            domain: "klimaatroute.nl",
            selector: "/content/nl-klimaatroute-com/nl_NL",
        },
    ],
    selectedTenant: "EW",
    urls: [
        { id: 1, value: "https://dev-www.energiewacht.nl/", tenant: "EW" },
        { id: 2, value: "https://dev-www.energiewacht.nl/cv-ketels", tenant: "EW" },
        {
            id: 3,
            value: "https://dev-www.energiewacht.nl/cv-ketels/onderhoud",
            tenant: "EW",
        },
        {
            id: 4,
            value: "https://dev-www.energiewacht.nl/zonnepanelen",
            tenant: "EW",
        },
        {
            id: 5,
            value: "https://dev-www.energiewacht.nl/warmtepompen",
            tenant: "EW",
        },
        {
            id: 6,
            value: "https://dev-www.energiewacht.nl/ventilatie",
            tenant: "EW",
        },
        { id: 7, value: "https://dev-www.energiewacht.nl/airco", tenant: "EW" },
        {
            id: 8,
            value: "https://dev-www.energiewacht.nl/airco/onderhoud",
            tenant: "EW",
        },
        {
            id: 9,
            value: "https://dev-www.energiewacht.nl/warmtepompen/onderhoud",
            tenant: "EW",
        },
        {
            id: 10,
            value: "https://dev-www.energiewacht.nl/zonneboilers/onderhoud",
            tenant: "EW",
        },
        {
            id: 11,
            value: "https://dev-www.energiewacht.nl/ventilatie/onderhoud",
            tenant: "EW",
        },
    ],
    components: [
        {
            id: 1,
            name: "Multi-Step Form",
            selector: "container",
            helperProps: ["action", "emailSubject"],
        },
        { id: 2, name: "Hero V1", selector: "heroV1", helperProps: ["heading"] },
        { id: 3, name: "Hero V2", selector: "heroV2" },
        { id: 4, name: "Hero V3", selector: "heroV3" },
        { id: 5, name: "Teaser V1", selector: "teasersV1" },
        { id: 6, name: "Teaser V2", selector: "teasersV2" },
        { id: 7, name: "Teaser V4", selector: "teasersV4" },
        { id: 8, name: "Teaser V6", selector: "teasersV5" },
    ],
};

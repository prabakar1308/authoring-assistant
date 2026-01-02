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
        // Energiewacht (EW)
        { id: 1, value: "https://dev-www.energiewacht.nl/", tenant: "EW" },
        { id: 2, value: "https://dev-www.energiewacht.nl/cv-ketels", tenant: "EW" },
        { id: 3, value: "https://dev-www.energiewacht.nl/cv-ketels/onderhoud", tenant: "EW" },
        { id: 4, value: "https://dev-www.energiewacht.nl/zonnepanelen", tenant: "EW" },
        { id: 5, value: "https://dev-www.energiewacht.nl/warmtepompen", tenant: "EW" },

        // Energiewacht West (EWW)
        { id: 12, value: "https://dev-www.energiewachtwest.nl/", tenant: "EWW" },
        { id: 13, value: "https://dev-www.energiewachtwest.nl/over-ons", tenant: "EWW" },
        { id: 14, value: "https://dev-www.energiewachtwest.nl/service", tenant: "EWW" },

        // Volta NXT (VOLNXT)
        { id: 15, value: "https://dev-www.voltanxt.nl/", tenant: "VOLNXT" },
        { id: 16, value: "https://dev-www.voltanxt.nl/producten", tenant: "VOLNXT" },
        { id: 17, value: "https://dev-www.voltanxt.nl/advies", tenant: "VOLNXT" },

        // Nederland Isoleert (NLI)
        { id: 18, value: "https://dev-www.nederlandisoleert.nl/", tenant: "NLI" },
        { id: 19, value: "https://dev-www.nederlandisoleert.nl/dakisolatie", tenant: "NLI" },
        { id: 20, value: "https://dev-www.nederlandisoleert.nl/vloerisolatie", tenant: "NLI" },

        // Klimaatroute (KLI)
        { id: 21, value: "https://dev-www.klimaatroute.nl/", tenant: "KLI" },
        { id: 22, value: "https://dev-www.klimaatroute.nl/zakelijk", tenant: "KLI" },
    ],
    components: [
        {
            id: 1,
            name: "Multi-Step Form",
            selector: "container",
            helperProps: ["action", "emailSubject"],
            tenant: "EW"
        },
        { id: 2, name: "Hero V1", selector: "heroV1", helperProps: ["heading"], tenant: "EW" },
        { id: 3, name: "Hero V2", selector: "heroV2", tenant: "EW" },
        { id: 4, name: "Hero V3", selector: "heroV3", tenant: "EWW" },
        { id: 5, name: "Teaser V1", selector: "teasersV1", tenant: "VOLNXT" },
        { id: 6, name: "Teaser V2", selector: "teasersV2", tenant: "NLI" },
        { id: 7, name: "Teaser V4", selector: "teasersV4", tenant: "KLI" },
        { id: 8, name: "Teaser V6", selector: "teasersV5", tenant: "EW" },
    ],
};

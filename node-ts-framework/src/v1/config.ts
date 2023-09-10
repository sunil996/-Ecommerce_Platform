const env: any = process.env.APP_ENV;

const localhost = {
    SITE_URL: 'http://localhost:4300/',
};

const development = {
    SITE_URL: 'https://dev.evitalrx.in/',
};

const production = {
    SITE_URL: 'https://www.evitalrx.in/',
};

const environments: any = {
    localhost,
    development,
    production
};

export const config = environments[env];

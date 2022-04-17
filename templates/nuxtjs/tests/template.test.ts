import Cluster from '@/Cluster';
import Template from '@/Template';
import path from 'path'

const nuxtTemplate = new Template(path.resolve(__dirname, '../'))

test('the template is valid', async () => {

    await expect(nuxtTemplate).toHaveValidSyntax();

})

test('the template cannot be parsed without the necessary variables', async () => {

    const parsing = nuxtTemplate.parse('app', 'website');

    const expectedErrors = {
        package_manager: [ 'The package manager field is required.' ],
        build_target: ['The build target field is required.'],
        build_script: [ 'The build script field is required.' ],
        path_to_build: [ 'The path to build field is required.' ],
    };

    await expect(parsing).toFailDueToIncorrectFormInput(expectedErrors)

})

describe('the template can be parsed', () => {
  
    test('with npm as package manager', async () => {

        const variables = {
            'path_to_source_code': 'src/',
            'package_manager': 'npm',
            'private_npm_registries': [
                {
                    'url': 'https://npm.pkg.github.com/',
                    'scope': '@spatie',
                    'auth_token': '5tS2O6eqzCMykMk9zF0za8L2QMbQGbbR',
                }
            ],
            'build_target': 'static',
            'build_script': "npm run generate",
            'path_to_build': 'dist/',
        }

        const environment = {
            'NUXT_ENV_API_HOST': 'abc123',
            'NUXT_ENV_STRIPE_KEY': 'xyz789',
        }

        const parsing = nuxtTemplate.parse('app', 'website', variables, environment);

        await expect(parsing).toSucceed();
        await expect(parsing).toMatchParsedTemplate(__dirname+'/concerns/parsed_templates/npm.yml');

    })
  
    test('with yarn as package manager', async () => {

        const variables = {
            'path_to_source_code': '',
            'package_manager': 'yarn',
            'build_target': 'static',
            'build_script': 'yarn run generate',
            'path_to_build': 'dist/',
            'additional_software_script': "apt-get install -y autoreconf",
        }

        const parsing = nuxtTemplate.parse('app', 'website', variables);

        await expect(parsing).toSucceed();
        await expect(parsing).toMatchParsedTemplate(__dirname+'/concerns/parsed_templates/yarn.yml');

    })
  
})

describe('the service works correctly when installed', () => {

    test('with npm as package manager', async () => {

        const cluster = await (new Cluster).start()

        try {
        
            const codeRepositoryPath = path.resolve(__dirname, 'concerns/application/')

            const variables = {
                'path_to_source_code': 'static/',
                'package_manager': 'npm',
                'build_target': 'static',
                'build_script': 'npm run generate',
                'path_to_build': 'dist/',
            }

            const environment = {
                'NUXT_ENV_APP_KEY': 'abc123',
            }

            const nuxtService = await cluster.installTemplate(nuxtTemplate, codeRepositoryPath, variables, environment)
            
            const host = `http://localhost:${nuxtService.getEntrypoint('nuxtjs_static')?.host_port}`;

            expect((await page.goto(`${host}/`))?.status()).toBe(200);
            expect(page.url()).toEqual(`${host}/`);
            expect(await page.content()).toContain('You are viewing the Home page.');
            expect(await page.content()).toContain('The application key is: abc123');

            expect((await page.goto(`${host}/blog`))?.status()).toBe(200);
            expect(page.url()).toEqual(`${host}/blog`);
            expect(await page.content()).toContain('You are viewing the Blog page.');

            expect((await page.goto(`${host}/blog/our-new-website`))?.status()).toBe(200);
            expect(page.url()).toEqual(`${host}/blog/our-new-website`);
            expect(await page.content()).toContain('You are reading the our-new-website article.');

            expect((await page.goto(`${host}/not-found`))?.status()).toBe(200);
            expect(page.url()).toEqual(`${host}/not-found`);
            expect(await page.content()).toContain('This page could not be found.');

        } finally {
            await cluster.stop()
        }

    }, 1000 * 60 * 5)

    test('with yarn as package manager', async () => {

        const cluster = await (new Cluster).start()

        try {
        
            const codeRepositoryPath = path.resolve(__dirname, 'concerns/application/static/')

            const variables = {
                'path_to_source_code': '/',
                'package_manager': 'yarn',
                'build_target': 'static',
                'build_script': 'yarn run generate',
                'path_to_build': 'dist/',
            }

            const nuxtService = await cluster.installTemplate(nuxtTemplate, codeRepositoryPath, variables)
            
            const host = `http://localhost:${nuxtService.getEntrypoint('nuxtjs_static')?.host_port}`;

            expect((await page.goto(`${host}/`))?.status()).toBe(200);
            expect(page.url()).toEqual(`${host}/`);
            expect(await page.content()).toContain('You are viewing the Home page.');
            expect(await page.content()).not.toContain('The application key is: abc123');

            expect((await page.goto(`${host}/blog`))?.status()).toBe(200);
            expect(page.url()).toEqual(`${host}/blog`);
            expect(await page.content()).toContain('You are viewing the Blog page.');

            expect((await page.goto(`${host}/blog/our-new-website`))?.status()).toBe(200);
            expect(page.url()).toEqual(`${host}/blog/our-new-website`);
            expect(await page.content()).toContain('You are reading the our-new-website article.');

            expect((await page.goto(`${host}/not-found`))?.status()).toBe(200);
            expect(page.url()).toEqual(`${host}/not-found`);
            expect(await page.content()).toContain('This page could not be found.');

        } finally {
            await cluster.stop()
        }

    }, 1000 * 60 * 5)

})
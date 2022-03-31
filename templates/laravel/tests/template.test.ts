import fs from 'fs'
import path from 'path'
import axios from 'axios'
import FormData from 'form-data'
import sleep from '@/sleep'
import Cluster from '@/Cluster'
import Template from '@/Template'
import TemplateService from '@/TemplateService'
import MysqlService from '@/MysqlService'

const laravelTemplate = new Template(path.resolve(__dirname, '../'))

test('the template is valid', async () => {

    await expect(laravelTemplate).toHaveValidSyntax()

})

test('the template can be parsed', async () => {

    const variables = {
        'path_to_source_code': 'services/laravel/',
        'paths_to_shared_libraries': [
            'libraries/ui-components',
        ],
        'php_version': '7.4',
        'private_composer_registries': [
            {
                'url': 'private.packagist.com',
                'username': 'john.doe@example.com',
                'password': 'secret',
            }
        ],
        'additional_software_script': `
apt-get install -y default-mysql-client

[ -d storage ] ?? echo "storage folder exists" || echo "storage folder does not exist"
`,
        'timezone': 'Europe/Brussels',
        'opcache_enabled': true,
        'maximum_file_upload_size': 25,
        'persistent_storage': true,
        'run_scheduler': true,
        'daemons': [
            {
                'command': 'php artisan horizon',
            },
            {
                'command': 'php artisan queue:work',
                'cpus': 0.5,
                'memory': 1024,
            },
        ],
        'build_assets': true,
        'package_manager': 'npm',
        'build_assets_script': 'npm run production',
        'deploy_script': 'php artisan config:cache\nphp artisan route:cache\nphp artisan view:cache',
        'release_script': 'php artisan db:ready\nphp artisan migrate --force',
    }

    const environment = {
        'APP_KEY': 'base64:c3SzeMQZZHPT+eLQH6BnpDhw/uKH2N5zgM2x2a8qpcA=',
        'APP_ENV': 'production',
        'APP_DEBUG': false,
    }

    const parsing = laravelTemplate.parse('app', 'backend', variables, environment)

    await expect(parsing).toSucceed()
    await expect(parsing).toMatchParsedTemplate(__dirname+'/concerns/parsed_template.yml')

}, 1000 * 15)

test("the service works correctly when installed", async () => {

    const cluster = await (new Cluster).start();

    try {

        const mysqlService = new MysqlService;

        await cluster.installCloudService(mysqlService)

        const codeRepositoryPath = path.resolve(__dirname, 'concerns/application/')

        const variables = {
            'path_to_source_code': '',
            'paths_to_shared_libraries': [],
            'php_version': '7.4',
            'private_composer_registries': [],
            'opcache_enabled': true,
            'maximum_file_upload_size': 25,
            'additional_software_script': `
                apt-get install -y default-mysql-client
            `,
            'timezone': 'Europe/Brussels',
            'run_scheduler': true,
            'daemons': [
                {
                    'command': 'php artisan queue:work',
                },
            ],
            'build_assets': true,
            'package_manager': 'npm',
            'build_assets_script': 'npm run production',
            'deploy_script': 'php artisan config:cache\nphp artisan view:cache',
            'release_script': 'sleep 10s\nphp artisan migrate --force',
        }

        const environment = {
            'APP_KEY': 'base64:c3SzeMQZZHPT+eLQH6BnpDhw/uKH2N5zgM2x2a8qpcA=',
            'APP_ENV': 'production',
            'APP_DEBUG': false,
            'DB_CONNECTION': 'mysql',
            'DB_HOST': mysqlService.getHost(),
            'DB_PORT': mysqlService.getPort(),
            'DB_USERNAME': mysqlService.getUsername(),
            'DB_PASSWORD': mysqlService.getPassword(),
            'DB_DATABASE': mysqlService.getDatabase(),
        }

        const laravelService = await cluster.installTemplate(
            laravelTemplate, codeRepositoryPath, variables, environment
        )

        const host = `http://localhost:${laravelService.getEntrypoint('nginx')?.host_port}`

        await assertThatHomepageCanBeVisited(host)
        await assertThatImagesFromTheStorageFolderCanBeLoaded(host)
        await assertThatPhpinfoShowsTheExpectedConfiguration(host)
        await assertThatLogsAreWrittenToStdout(laravelService, host)
        await assertThatCronJobIsExecuted(laravelService)
        await assertThatQueuedJobsAreExecuted(laravelService, host)
        await assertThatFilesCanBeUploaded(host)

    } finally {
        await cluster.stop()
    }

}, 1000 * 60 * 5)

async function assertThatHomepageCanBeVisited(host: string): Promise<void>
{
    expect((await page.goto(`${host}/`))?.status()).toBe(200)
    expect(page.url()).toEqual(`${host}/`)
    expect(await page.content()).toContain('Laravel')
}

async function assertThatImagesFromTheStorageFolderCanBeLoaded(host: string): Promise<void>
{
    const image_response = await axios.get(`${host}/img/image.jpg`)

    expect(image_response.status).toBe(200)
}

async function assertThatPhpinfoShowsTheExpectedConfiguration(host: string): Promise<void>
{
    expect((await page.goto(`${host}/phpinfo`))?.status()).toBe(200)
    expect(page.url()).toEqual(`${host}/phpinfo`)

    const html = await page.evaluate(() => document.body.innerHTML)
    expect(html).toContain('<td class="e">post_max_size</td><td class="v">25M</td><td class="v">25M</td>')
    expect(html).toContain('<td class="e">upload_max_filesize</td><td class="v">25M</td><td class="v">25M</td>')
    expect(html).toContain('<td class="e">date.timezone</td><td class="v">Europe/Brussels</td>')
}

async function assertThatLogsAreWrittenToStdout(laravelService: TemplateService, host: string): Promise<void>
{
    const logs1 = await laravelService.getLogsOfStatelessSet('laravel');

    expect(logs1).toContain("Current default time zone: 'Europe/Brussels'")
    expect(logs1).not.toContain("production.ERROR: Woops, something went wrong.")

    await page.goto(`${host}/log`)

    const logs2 = await laravelService.getLogsOfStatelessSet('laravel');

    expect(logs2).toContain("production.ERROR: Woops, something went wrong.")
}

async function assertThatCronJobIsExecuted(laravelService: TemplateService): Promise<void>
{
    const logs = await laravelService.getLogsOfCronJob('scheduler');

    expect(logs).toContain('production.NOTICE: Cron job executed.')
}

async function assertThatQueuedJobsAreExecuted(laravelService: TemplateService, host: string): Promise<void>
{
    await page.goto(`${host}/job`)

    await sleep(5)

    const logs = await laravelService.getLogsOfStatelessSet('daemon_0');

    expect(logs).toContain('production.NOTICE: Queued job executed.')
}

async function assertThatFilesCanBeUploaded(host: string): Promise<void>
{
    const form = new FormData()

    form.append('image', fs.createReadStream(path.resolve(__dirname, 'concerns/image.jpg')))

    const uploadResponse = await axios.post(`${host}/image-upload`, form, {
        headers: {
            ...form.getHeaders()
        }
    })

    expect(uploadResponse.status).toBe(200)
}

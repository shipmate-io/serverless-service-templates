// @ts-ignore
import exec from 'await-exec'
import path from 'path'
import tmp, { DirResult as Directory } from 'tmp'
const escape = require('escape-string-regexp')

tmp.setGracefulCleanup()

class ZipTemplate
{
    directory: Directory

    constructor()
    {
        this.directory = tmp.dirSync()
    }

    async execute(templatePath: string, includeTaggedVersions: boolean): Promise<string>
    {
        await this.copyLatestVersionToDirectory(templatePath)
        if (includeTaggedVersions) {
            await this.copyTaggedVersionsToDirectory(templatePath)
        } else {
            await exec(`rm -f ${this.directory.name}/latest/template/migrations.yml`);
        }
        await this.zipContentsOfDirectory()
        return `${this.directory.name}/template.zip`
    }

    async copyLatestVersionToDirectory(templatePath: string): Promise<void>
    {
        await exec(`cd ${this.directory.name} && rsync -a ${templatePath}/template latest`);
    }

    async copyTaggedVersionsToDirectory(templatePath: string): Promise<void>
    {
        const repositoryPath = path.resolve(templatePath, '../../')
        const templateName = path.basename(templatePath)
        const tags: string[] = await this.getTags(repositoryPath, templateName)

        for(const tag of tags) {
            const version = tag.replace(`${templateName}-`, '')
            const escapedTemplatePath = escape(`${this.directory.name}/${version}/templates/${templateName}`)

            await exec(`git clone --depth 1 --branch ${tag} ${repositoryPath} ${this.directory.name}/${version}`)
            await exec(`find ${this.directory.name}/${version} -mindepth 1 ! -regex '^${escapedTemplatePath}.*' -delete`)
            await exec(`mv ${this.directory.name}/${version}/templates/${templateName}/* ${this.directory.name}/${version}`)
            await exec(`rm -r ${this.directory.name}/${version}/templates`)
        }
    }

    async getTags(repositoryPath: string, templateName: string): Promise<string[]>
    {
        const output = await exec(`git -C ${repositoryPath} tag | cat`)

        if(output.stderr) {
            throw output.stderr
        }

        const tags = output.stdout.split("\n").filter((item: string) => {

            return new RegExp(`^${templateName}-\\d+\\.\\d+\\.\\d+$`).test(item)

        })

        return tags
    }

    async zipContentsOfDirectory(): Promise<void>
    {
        await exec(`cd ${this.directory.name} && zip -r template.zip .`);
    }
}

export default ZipTemplate

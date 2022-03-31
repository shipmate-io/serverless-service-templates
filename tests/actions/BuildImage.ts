import tmp, { DirResult as Directory } from 'tmp'
// @ts-ignore
import exec from 'await-exec'
import fs from 'fs'
import Docker from 'dockerode'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import tarfs from 'tar-fs'
import { ParsedTemplate, Image } from '@/types'

interface ProgressEvent {
    error?: string;
    stream?: string;
}

class BuildImage
{
    docker: Docker

    constructor()
    {
        this.docker = new Docker()
    }

    async execute(codeRepositoryPath: string, template: ParsedTemplate, image: Image): Promise<void>
    {
        const buildDirectory: Directory = tmp.dirSync()

        try {

            await this.copyCodeRepositoryContentsToBuildFolder(codeRepositoryPath, image, buildDirectory)

            this.copyImageFilesToBuildFolder(template, buildDirectory)

            const stream: NodeJS.ReadableStream = await this.buildImage(image, buildDirectory)

            await this.processBuildOutput(stream)

        } finally {
            rimraf.sync(buildDirectory.name)
        }
    }

    /*
     * Do not copy .git directory and respect .gitignore file.
     */
    async copyCodeRepositoryContentsToBuildFolder(
        codeRepositoryPath: string, image: Image, buildDirectory: Directory
    ): Promise<void>
    {
        codeRepositoryPath = codeRepositoryPath.replace(/[/]+$/, "")

        await exec(`rsync -azP --delete --exclude='.git' --filter=":- .gitignore" ${codeRepositoryPath}/. ${buildDirectory.name}/code-repository/`)
    }

    copyImageFilesToBuildFolder(template: ParsedTemplate, buildDirectory: Directory): void
    {
        for (const file of template.files) {
            const folderPath = file.path.substring(0, file.path.lastIndexOf("/"))
            mkdirp.sync(`${buildDirectory.name}/${folderPath}`)
            fs.writeFileSync(`${buildDirectory.name}/${file.path}`, file.contents)
        }
    }

    async buildImage(image: Image, buildDirectory: Directory): Promise<NodeJS.ReadableStream>
    {
        const pack = tarfs.pack(buildDirectory.name)

        return await this.docker.buildImage(pack, {
            dockerfile: image.dockerfile_path,
            t: image.id,
            buildargs: (image?.arguments || []).reduce((result: Record<string, any>, argument) => {
                result[argument.name] = argument.value
                return result
            }, {})
        })
    }

    async processBuildOutput(stream: NodeJS.ReadableStream): Promise<void>
    {
        await new Promise((resolve, reject) => {

            let progess = ''
            this.docker.modem.followProgress(stream, onFinished, onProgress);

            function onFinished(err: Error|string, output: any) {
                if (err) {
                    reject(err)
                }
                resolve(output)
            }

            function onProgress(event: ProgressEvent) {
                if (event.error) {
                    reject(`An error occurred during the build of the Dockerfile: \n\n ${progess} \n\n ${event.error}`)
                }
                if(event.stream) {
                    progess += event.stream
                    // console.log(event.stream)
                }
            }

        })
    }
}

export default BuildImage

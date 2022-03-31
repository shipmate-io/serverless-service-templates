// @ts-ignore
import exec from 'await-exec'
import { v4 as uuidv4 } from 'uuid'
import InstallTemplate from './actions/InstallTemplate';
import TemplateService from './TemplateService';
import Template from './Template';
import { Variables, CloudService } from './types';

export default class Cluster
{
    private id: string;
    private ports: number[] = [];

    constructor()
    {
        this.id = 'cody-'+uuidv4().substring(0, 8)

        const minPort = 30000
        const maxPort = 32767

        while (this.ports.length < 10) {
            const randomPort = Math.floor(Math.random() * (maxPort - minPort)) + minPort;

            if(! this.ports.includes(randomPort)) {
                this.ports.push(randomPort)
            }
        }
    }

    public getId(): string
    {
        return this.id
    }

    public async start(): Promise<this>
    {
        const hostPorts = this.ports.map((port: Number) => `-p "${port}:${port}@agent:0"`).join(' ')

        await exec(`k3d cluster create ${this.id} ${hostPorts} --agents 1`)

        return this
    }

    public async installTemplate(
        template: Template, codeRepositoryPath: string|null, variables: Variables = {}, environment: Variables = {},
        initializationTimeInSeconds: number = 30
    ): Promise<TemplateService>
    {
        const applicationSlug = 'app-'+uuidv4().substring(0, 8)
        const serviceName = 'svc-'+uuidv4().substring(0, 8)
        const parsedTemplate = await template.parse(applicationSlug, serviceName, variables, environment)

        await (new InstallTemplate).execute(
            this.id, this.ports, parsedTemplate, codeRepositoryPath, initializationTimeInSeconds
        )

        return new TemplateService(this.id, parsedTemplate)
    }

    public async installCloudService(cloudService: CloudService): Promise<void>
    {
        return cloudService.install(this.id)
    }

    public async stop(): Promise<void>
    {
        await exec(`k3d cluster delete ${this.id}`)
    }
}

import { Entrypoint, ParsedTemplate, StatelessSet } from '@/types'
import * as k8s from '@kubernetes/client-node';

export default class Service
{
    private clusterId: string
    private parsedTemplate: ParsedTemplate

    constructor(clusterId: string, parsedTemplate: ParsedTemplate)
    {
        this.clusterId = clusterId
        this.parsedTemplate = parsedTemplate
    }

    // getters

    public getStatelessSet(name: string): StatelessSet|null
    {
        for(const resource of this.parsedTemplate.deployment) {
            if(resource.type !== 'stateless_set') continue
            if(resource.name === name) return resource
        }

        return null
    }

    public getEntrypoint(name: string): Entrypoint|null
    {
        for(const resource of this.parsedTemplate.deployment) {
            if(resource.type !== 'entrypoint') continue
            if(resource.name === name) return resource
        }

        return null
    }

    // logs

    public async getLogsOfStatelessSet(name: string): Promise<string>
    {
        return this.getLogsOfResource('stateless_set', name);
    }

    public async getLogsOfCronJob(name: string): Promise<string>
    {
        return this.getLogsOfResource('cron_job', name);
    }

    private async getLogsOfResource(type: string, name: string): Promise<string>
    {
        let resource = null;

        for(const iterator of this.parsedTemplate.deployment) {
            if(iterator.type !== type) continue
            if(iterator.name === name) {
                resource = iterator;
                break;
            }
        }

        if(! resource) {
            throw `Resource "${name}" not found.`;
        }

        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        kc.setCurrentContext(`k3d-${this.clusterId}`);

        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);

        const pods = await k8sCoreV1Api
            .listNamespacedPod('default', undefined, undefined, undefined, undefined, `cody/managed-by=${resource.id}`)
            .then(response => response.body.items);

        if(pods.length === 0 || ! pods[0].metadata?.name) {
            throw `No pods found for resource "${name}".`;
        }

        return await k8sCoreV1Api
            .readNamespacedPodLog(pods[0].metadata?.name, 'default')
            .then(response => response.body || '');
    }
}

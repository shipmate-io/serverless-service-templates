import * as k8s from '@kubernetes/client-node';
import sleep from '@/sleep';

export default class MysqlService
{
    public getHost(): string
    {
        return 'mysql'
    }

    public getPort(): number
    {
        return 3306
    }

    public getUsername(): string
    {
        return 'root'
    }

    public getPassword(): string
    {
        return 'secret'
    }

    public getDatabase(): string
    {
        return 'application'
    }

    public async install(clusterId: string): Promise<void>
    {
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        kc.setCurrentContext(`k3d-${clusterId}`);

        const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        const k8sAppsV1Api = kc.makeApiClient(k8s.AppsV1Api);

        await k8sAppsV1Api.createNamespacedDeployment('default', {
            metadata: {
                name: 'mysql'
            },
            spec: {
                selector: {
                    matchLabels: {
                        'cody/managed-by': 'mysql'
                    }
                },
                replicas: 1,
                strategy: {
                    type: 'Recreate'
                },
                template: {
                    metadata: {
                        labels: {
                            'cody/managed-by': 'mysql',
                        }
                    },
                    spec: {
                        containers: [
                            {
                                name: 'mysql',
                                image: 'mysql/mysql-server:8.0',
                                env: [
                                    { name: 'MYSQL_ROOT_PASSWORD', value: 'secret' },
                                    { name: 'MYSQL_ROOT_HOST', value: '%' },
                                    { name: 'MYSQL_ALLOW_EMPTY_PASSWORD', value: '1' },
                                    { name: 'MYSQL_DATABASE', value: 'application' },
                                ]
                            }
                        ],
                        restartPolicy: 'Always',
                    }
                }
            }
        })

        await k8sCoreV1Api.createNamespacedService('default', {
            metadata: {
                name: 'mysql'
            },
            spec: {
                selector: {
                    'cody/managed-by': 'mysql'
                },
                ports: [
                    {
                        port: 3306
                    }
                ]
            }
        })

        await sleep(60)
    }
}

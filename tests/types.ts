/*
 * Template
 */

export interface File {
    path: string
    contents: string
}

export interface ParsedTemplate {
    name: string
    version: string
    alias: string
    description: string
    icon: string|null
    api: 'v1'
    form: any
    deployment: Resource[]
    interfaces: Interface[]
    files: File[];
}

/*
 * Variables
 */

export type Variables = Record<string, any>

/*
 * Resources
 */

export type Resource = Image | Volume | ConfigFile | StatelessSet | DaemonSet | Job | CronJob | Entrypoint

export interface Image {
    name: string;
    id: string;
    type: "image";
    dockerfile_path: string;
    code_repository: string;
    arguments: Argument[]
}

export interface Argument {
    name: string;
    value: any;
}

export interface Volume {
    name: string;
    id: string;
    access_modes: Array<string>;
    size: number;
    type: "volume";
}

export interface ConfigFile {
    name: string;
    id: string;
    type: "config_file";
    contents: string;
}

export interface CronJob {
    name: string;
    id: string;
    type: "cron_job";
    schedule: string;
    retries: number|null;
    timeout: number|null;
    containers: Container[];
}

export interface Job {
    name: string;
    id: string;
    type: "job";
    retries: number|null;
    timeout: number|null;
    containers: Container[];
}

export interface StatelessSet {
    name: string;
    id: string;
    type: "stateless_set";
    replicas: number;
    update_strategy: "recreate"|"rolling_update";
    containers: Container[];
}

export interface DaemonSet {
    name: string;
    id: string;
    type: "daemon_set";
    containers: Container[];
}

export interface Container {
    name: string;
    id: string;
    type: "container";
    image: string;
    command?: string[];
    environment_variables?: EnvironmentVariable[];
    volume_mounts?: VolumeMount[];
    config_file_mounts?: ConfigFileMount[];
    cpus: ComputeResource;
    memory: ComputeResource;
}

export interface ComputeResource {
    minimum: number;
    maximum: number;
}

export interface EnvironmentVariable {
    name: string;
    value: any;
}

export interface VolumeMount {
    volume: string;
    mount_path: string;
}

export interface ConfigFileMount {
    config_file: string;
    mount_path: string;
}

export interface Entrypoint {
    name: string;
    id: string;
    type: "entrypoint";
    alias: string|null;
    description: string|null;
    target: EntrypointTarget;
    protocol: "TCP"|"UDP"|"HTTPS";
    port: number;
    host_port?: number;
}

type EntrypointTarget = EntrypointSetTarget

interface EntrypointSetTarget {
    type: string
    set_type: string
    set_id: string
}

/*
 * Interfaces
 */

export type Interface = LogInterface | VolumeInterface

export interface LogInterface {
    //
}

export interface VolumeInterface {
    //
}

/*
 * Cloud services
 */

export interface CloudService {
    install(clusterId: string): Promise<void>;
}

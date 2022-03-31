import { ParsedTemplate, Variables } from '@/types'
import ZipTemplate from "@/actions/ZipTemplate";
import CodyApi from "@/api/CodyApi";

export default class Template
{
    templatePath: string

    constructor(templatePath: string)
    {
        this.templatePath = templatePath
    }

    public getPath(): string
    {
        return this.templatePath
    }

    public async parse(
        environmentSlug: string, serviceName: string, variables: Variables = {}, environment: Variables = {}
    ): Promise<ParsedTemplate>
    {
        const templateName = this.templatePath.split(/[\\/]/).pop() || 'template'
        const pathToZipFile = await (new ZipTemplate).execute(this.templatePath, false)

        return await (new CodyApi).parseTemplate(
            environmentSlug, serviceName, templateName, pathToZipFile, variables, environment
        )
    }
}

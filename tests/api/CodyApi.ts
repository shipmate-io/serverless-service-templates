import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import ApiError from '@/api/ApiError'
import { ParsedTemplate, Variables } from '@/types'

export default class CodyApi {

    host = process.env.CODY_API_URL ? process.env.CODY_API_URL : "https://api.internal.cody.build"

    async validateTemplate(pathToZipFile: string): Promise<void>
    {
        const form = new FormData()

        form.append('template', fs.createReadStream(pathToZipFile))
        form.append('service_type', 'serverless')

        try {
            await axios.post(`${this.host}/v1/service-templates/local/validate`, form, {
                headers: {
                    ...form.getHeaders()
                }
            })
        } catch (error) {
            throw new ApiError(error.response)
        }
    }

    async parseTemplate(
        environmentSlug: string, serviceName: string, templateName: string, pathToZipFile: string, variables: Variables,
        environment: Variables
    ): Promise<ParsedTemplate>
    {
        const form = new FormData()

        form.append('environment_slug', environmentSlug)
        form.append('service_name', serviceName)
        form.append('service_type', 'serverless')
        form.append('template_name', templateName)
        form.append('template', fs.createReadStream(pathToZipFile))

        for (const [name, value] of Object.entries(this.transformValueToFormData('variables', variables))) {
            form.append(name, value);
        }

        for (const [name, value] of Object.entries(this.transformValueToFormData('environment_variables', environment))) {
            form.append(name, value);
        }

        try {
            const response = await axios.post(`${this.host}/v1/service-templates/local/parse`, form, {
                headers: {
                    ...form.getHeaders()
                },
            })

            return response.data.data
        } catch (error) {
            console.log(error)
            throw new ApiError(error.response)
        }
    }

    transformValueToFormData(name: string, value: any): Record<string, any> {
        let formData: Record<string, any> = {}

        if (typeof value === 'object') {
            for (const [nestedName, nestedValue] of Object.entries(value)) {
                formData = {
                    ...formData,
                    ...this.transformValueToFormData(`${name}[${nestedName}]`, nestedValue)
                }
            }
        } else {
            formData[name] = String(value)
        }

        return formData
    }

}

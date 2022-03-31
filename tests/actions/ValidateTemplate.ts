import CodyApi from '@/api/CodyApi'
import ZipTemplate from '@/actions/ZipTemplate'
import ApiError from '@/api/ApiError'

export class ValidateTemplate
{
    async execute(templatePath: string): Promise<ApiError|null>
    {
        const pathToZipFile: string = await (new ZipTemplate).execute(templatePath, true)

        try {
            await (new CodyApi).validateTemplate(pathToZipFile)
        } catch (error) {
            return error
        }

        return null
    }
}

export default ValidateTemplate

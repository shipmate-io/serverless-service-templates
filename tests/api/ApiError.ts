interface Response {
    data: {
        message: string,
        status: number,
        errors: Object,
    }
}

class ApiError extends Error
{
    status: number
    errors: Object

    constructor(response: Response)
    {
        super(response.data.message)
        this.status = response.data.status
        this.errors = response.data.errors || {}
    }
}

export default ApiError
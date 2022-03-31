declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveValidSyntax(): R
            toFailDueToIncorrectFormInput(expectedExceptions: Record<string, string[]>): R
            toSucceed(): R
            toMatchParsedTemplate(pathToParsedTemplate: string): R
        }
    }
}

export {};

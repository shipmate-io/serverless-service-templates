async function sleep(seconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000 * seconds))
}

export default sleep;
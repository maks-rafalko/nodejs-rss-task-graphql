const uuidRegex = new RegExp(
    '^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$'
);

function isUuid(uuid: string): boolean {
    return uuidRegex.test(uuid);
}

export { isUuid };
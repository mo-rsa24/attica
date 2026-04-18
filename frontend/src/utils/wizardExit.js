export async function saveDraftAndExit({
    saveAndExit,
    draftId,
    navigate,
    destination = '/my-events',
}) {
    const result = await saveAndExit(draftId);
    if (result?.ok) {
        navigate(destination);
        return true;
    }
    globalThis.alert?.('We could not save your draft to the server. Your local changes remain on this device.');
    return false;
}

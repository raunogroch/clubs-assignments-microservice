export function calculateAdminsChanges(
  currentAdmins: string[],
  validatedAdmins: string[],
) {
  const currentSet = new Set(currentAdmins);
  const validatedSet = new Set(validatedAdmins);

  const addedAdmins = validatedAdmins.filter((id) => !currentSet.has(id));

  const removedAdmins = currentAdmins.filter((id) => !validatedSet.has(id));

  return {
    addedAdmins,
    removedAdmins,
  };
}

import type { WizardData } from "./auth-return";

export function buildCheckoutPayload(
  data: WizardData,
  checkoutNonce: string,
  cardToken: string,
  targetOrganizationId: string | null,
  newDistinctAdministration: boolean,
) {
  return {
    offerId: data.plan,
    checkoutNonce,
    cardToken,
    administrationName: data.administrationName,
    responsibleName: data.responsibleName,
    email: data.email,
    buildingName: data.buildingName,
    buildingAddress: data.address,
    units: Number(data.units),
    targetOrganizationId,
    newDistinctAdministration,
  };
}

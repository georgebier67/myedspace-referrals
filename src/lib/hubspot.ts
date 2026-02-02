// HubSpot Forms API integration
// Using public Forms API - no authentication required

interface HubSpotFormSubmission {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  referral_link?: string;
  referred_by?: string;
  [key: string]: string | undefined;
}

export async function submitToHubSpotForm(
  fields: HubSpotFormSubmission
): Promise<{ success: boolean; error?: string }> {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formGuid = process.env.HUBSPOT_FORM_GUID;

  if (!portalId || !formGuid) {
    console.error('HubSpot configuration missing');
    return { success: false, error: 'HubSpot configuration missing' };
  }

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

  // Format fields for HubSpot
  const formattedFields = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([name, value]) => ({
      name,
      value: value as string,
    }));

  const payload = {
    fields: formattedFields,
    context: {
      pageUri: process.env.NEXT_PUBLIC_BASE_URL || 'https://referrals.myedspace.com',
      pageName: 'Referral Registration',
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('HubSpot form submission failed:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('HubSpot form submission error:', error);
    return { success: false, error: String(error) };
  }
}

// Submit referrer registration to HubSpot
export async function submitReferrerToHubSpot(
  email: string,
  name: string,
  referralLink: string
): Promise<{ success: boolean; error?: string }> {
  const nameParts = name.split(' ');
  const firstname = nameParts[0] || '';
  const lastname = nameParts.slice(1).join(' ') || '';

  return submitToHubSpotForm({
    email,
    firstname,
    lastname,
    referral_link: referralLink,
  });
}

// Submit referred friend to HubSpot
export async function submitReferredFriendToHubSpot(
  email: string,
  name: string,
  phone: string,
  referrerEmail: string
): Promise<{ success: boolean; error?: string }> {
  const nameParts = name.split(' ');
  const firstname = nameParts[0] || '';
  const lastname = nameParts.slice(1).join(' ') || '';

  return submitToHubSpotForm({
    email,
    firstname,
    lastname,
    phone,
    referred_by: referrerEmail,
  });
}

// HubSpot Forms API integration
// Using public Forms API - no authentication required
// Also includes Contacts API for updating properties (requires Private App token)

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

// ================== CONTACTS API (requires Private App token) ==================

// Update a contact's properties in HubSpot
export async function updateHubSpotContact(
  email: string,
  properties: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('HUBSPOT_ACCESS_TOKEN not configured');
    return { success: false, error: 'HubSpot access token not configured' };
  }

  try {
    // First, search for the contact by email
    const searchUrl = 'https://api.hubapi.com/crm/v3/objects/contacts/search';
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('HubSpot contact search failed:', errorText);
      return { success: false, error: errorText };
    }

    const searchData = await searchResponse.json();

    if (searchData.total === 0) {
      return { success: false, error: 'Contact not found in HubSpot' };
    }

    const contactId = searchData.results[0].id;

    // Update the contact's properties
    const updateUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('HubSpot contact update failed:', errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error('HubSpot contact update error:', error);
    return { success: false, error: String(error) };
  }
}

// Update referrer's referral status in HubSpot
// This triggers HubSpot workflow to send email notification
export async function updateReferrerStatus(
  referrerEmail: string,
  status: 'qualified' | 'rewarded'
): Promise<{ success: boolean; error?: string }> {
  return updateHubSpotContact(referrerEmail, {
    referral_status: status,
  });
}

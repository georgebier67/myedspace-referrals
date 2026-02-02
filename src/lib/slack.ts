export async function sendSlackNotification(message: string): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('Slack webhook URL not configured');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    return false;
  }
}

export async function notifyReferralQualified(
  referrerName: string,
  referrerEmail: string,
  friendName: string,
  rewardAmount: string = '$150 Amazon voucher'
): Promise<boolean> {
  const message = `
:tada: *Referral Reward Qualified!*

*Referrer:* ${referrerName} (${referrerEmail})
*Referred Friend:* ${friendName}
*Reward:* ${rewardAmount}

The 30-day window has passed and the referral is eligible for reward. Please process the Amazon gift card.
  `.trim();

  return sendSlackNotification(message);
}

export async function notifyNewReferral(
  referrerName: string,
  friendName: string,
  friendEmail: string
): Promise<boolean> {
  const message = `
:star: *New Referral Signup!*

*Referrer:* ${referrerName}
*New Lead:* ${friendName} (${friendEmail})

A new friend has signed up through a referral link.
  `.trim();

  return sendSlackNotification(message);
}

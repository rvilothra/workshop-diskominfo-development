const twilio = require("twilio");

// Initialize Twilio client with SSL configuration
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
  {
    // Add SSL configuration for production
    httpsAgent: new (require("https").Agent)({
      rejectUnauthorized: false, // Allow self-signed certificates
      secureProtocol: "TLSv1_2_method",
    }),
  }
);

/**
 * Send WhatsApp message using Twilio
 * @param {Object} params - Parameters for sending WhatsApp
 * @param {string} params.to - Recipient phone number (E.164 format)
 * @param {string} params.body - Message body
 * @returns {Promise<Object>} Twilio message object
 */
async function sendWhatsApp({ to, body }) {
  try {
    // Format the 'to' number for WhatsApp
    const whatsappTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    const message = await client.messages.create({
      body: body,
      from: process.env.TWILIO_WHATSAPP_FROM, // This should be 'whatsapp:+14155238886' for sandbox
      to: whatsappTo,
    });

    console.log(`WhatsApp message sent successfully: ${message.sid}`);
    return {
      success: true,
      messageId: message.sid,
      status: message.status,
    };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}

/**
 * Send status update notification via WhatsApp
 * @param {Object} submission - Submission object
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Result of sending notification
 */
async function sendStatusUpdateNotification(submission, newStatus) {
  const statusText = getStatusText(newStatus);
  const trackingUrl = `${process.env.APP_BASE_URL}/public?tab=status&tracking_code=${submission.tracking_code}`;

  const message = `Halo ${submission.nama}, pengajuan ${submission.jenis_layanan} (#${submission.tracking_code}) kini berstatus: ${statusText}. Cek: ${trackingUrl}`;

  return await sendWhatsApp({
    to: submission.no_wa,
    body: message,
  });
}

/**
 * Get human-readable status text
 * @param {string} status - Status code
 * @returns {string} Human-readable status
 */
function getStatusText(status) {
  switch (status) {
    case "PENGAJUAN_BARU":
      return "Pengajuan Baru";
    case "DIPROSES":
      return "Sedang Diproses";
    case "SELESAI":
      return "Selesai";
    case "DITOLAK":
      return "Ditolak";
    default:
      return status;
  }
}

module.exports = {
  sendWhatsApp,
  sendStatusUpdateNotification,
};

const { Resend } = require("resend");

// Initialize Resend client with SSL configuration
const resend = new Resend(process.env.RESEND_API_KEY, {
  // Add SSL configuration for production
  httpsAgent: new (require("https").Agent)({
    rejectUnauthorized: false, // Allow self-signed certificates
    secureProtocol: "TLSv1_2_method",
  }),
});

/**
 * Send email using Resend
 * @param {Object} params - Parameters for sending email
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.html - Email HTML content
 * @returns {Promise<Object>} Resend response object
 */
async function sendEmail({ to, subject, html, from = null }) {
  try {
    // Use provided from email or fallback to environment variable
    const fromEmail = from || process.env.EMAIL_FROM;

    console.log("📤 Sending email via Resend...");
    const data = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("📨 Resend response:", JSON.stringify(data, null, 2));

    // Check if there's an error in the response
    if (data.error) {
      throw new Error(data.error.message || "Resend API error");
    }

    console.log(`Email sent successfully:`, data);
    return {
      success: true,
      messageId: data.data?.id || data.id || data.messageId || "unknown",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Send status update notification via email
 * @param {Object} submission - Submission object
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Result of sending notification
 */
async function sendStatusUpdateEmail(submission, newStatus) {
  if (!submission.email) {
    return {
      success: false,
      error: "No email address provided",
    };
  }

  const statusText = getStatusText(newStatus);
  const trackingUrl = `${process.env.APP_BASE_URL}/public?tab=status&tracking_code=${submission.tracking_code}`;

  const subject = `Update Status Pengajuan - ${submission.tracking_code}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Update Status Pengajuan</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .status { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Update Status Pengajuan</h1>
        </div>
        <div class="content">
          <p>Halo <strong>${submission.nama}</strong>,</p>
          
          <p>Status pengajuan layanan Anda telah diperbarui:</p>
          
          <div class="status">
            <strong>Kode Tracking:</strong> ${submission.tracking_code}<br>
            <strong>Jenis Layanan:</strong> ${submission.jenis_layanan}<br>
            <strong>Status Baru:</strong> ${statusText}
          </div>
          
          <p>Anda dapat mengecek status terbaru dengan mengklik tombol di bawah ini:</p>
          
          <a href="${trackingUrl}" class="button">Cek Status Pengajuan</a>
          
          <p>Atau kunjungi link berikut:</p>
          <p><a href="${trackingUrl}">${trackingUrl}</a></p>
          
          <p>Terima kasih telah menggunakan layanan kami.</p>
        </div>
        <div class="footer">
          <p>Email ini dikirim otomatis oleh sistem Layanan Publik Mobile</p>
          <p>Jangan balas email ini karena tidak akan diproses</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: submission.email,
    subject: subject,
    html: html,
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
  sendEmail,
  sendStatusUpdateEmail,
};

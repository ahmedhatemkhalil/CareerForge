import User from "../models/User.js";
import EmailVerification from "../models/EmailVerification.js";

// GET /api/auth/verify/:token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const verification = await EmailVerification.findOne({
      token: token,
      is_used: false,
      expires_at: { $gt: new Date() },
    });
    
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!verification) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; text-align: center; margin: 0;">
          <div style="max-width: 450px; margin: 40px auto; background: white; padding: 30px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
            
            <div style="margin-bottom: 20px;">
              <i class="fa-solid fa-triangle-exclamation" style="font-size: 55px; color: #dc3545;"></i>
            </div>

            <h2 style="color: #333; margin-bottom: 10px; font-size: 22px;">Invalid or Expired Token</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px; font-size: 15px;">The verification link is invalid or has already expired.</p>
            
            <div style="margin-bottom: 15px;">
              <a href="${frontendUrl}/resend-verification" style="
                display: inline-block;
                padding: 12px 25px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 15px;
                box-shadow: 0 2px 5px rgba(0,123,255,0.2);
              ">
                Request New Link
              </a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #bbb; font-size: 11px;">CareerForge Team © 2026</p>
          </div>
        </body>
        </html>
      `);
    }

    const user = await User.findById(verification.user_id);

    if (!user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; text-align: center; margin: 0;">
          <div style="max-width: 450px; margin: 40px auto; background: white; padding: 30px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
            
            <div style="margin-bottom: 20px;">
              <i class="fa-solid fa-circle-xmark" style="font-size: 55px; color: #dc3545;"></i>
            </div>

            <h2 style="color: #333; margin-bottom: 10px; font-size: 22px;">User Not Found</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 15px;">We couldn't find the account associated with this verification link.</p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #bbb; font-size: 11px;">CareerForge Team © 2026</p>
          </div>
        </body>
        </html>
      `);
    }

    user.is_verified = true;
    await user.save();

    verification.is_used = true;
    await verification.save();

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="refresh" content="3;url=${frontendUrl}/login" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      </head>
      <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; text-align: center; margin: 0;">
        <div style="max-width: 450px; margin: 40px auto; background: white; padding: 30px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
          
          <div style="margin-bottom: 20px;">
            <i class="fa-solid fa-circle-check" style="font-size: 55px; color: #28a745;"></i>
          </div>

          <h2 style="color: #28a745; margin-bottom: 10px; font-size: 22px;">Email Verified Successfully!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 15px;">Your account is now active. Redirecting to the login page...</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 14px;">If not redirected, <a href="${frontendUrl}/login" style="color: #007bff; text-decoration: none; font-weight: bold;">click here</a></p>
          <p style="color: #bbb; font-size: 11px; margin-top: 15px;">CareerForge Team © 2026</p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
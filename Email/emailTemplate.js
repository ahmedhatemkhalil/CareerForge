export const template = (verifyUrl) => {

    return `<div style=" font-family:Arial;
     background:#f4f4f4; padding:40px; text-align:center; ">
      <div style=" max-width:400px; margin:auto;
       background:white; padding:30px; border-radius:10px;
        box-shadow:0 0 10px rgba(0,0,0,0.1); "> 
        <h2>Verify Your Email</h2> 
        <p>Click the button below to activate your account</p> 
        <a href="${verifyUrl}" style=" display:inline-block; margin-top:20px; padding:12px 20px;
         background:green; color:white; text-decoration:none;
          border-radius:8px; ">
     Verify Account </a> </div> </div>`
}
export const resetPasswordTemplate = (resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 40px; text-align: center;">
      <div style="max-width: 450px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <h2 style="color: #333;">Password Reset Request</h2>
        
        <p style="color: #666; line-height: 1.6;">
          We received a request to reset your password. <br>
          If you didn't make this request, you can safely ignore this email.
        </p>

        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="
            display: inline-block;
            padding: 14px 25px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
          ">
            Reset Password
          </a>
        </div>

        <p style="color: #999; font-size: 12px;">
          This link will expire in 15 minutes.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #bbb; font-size: 11px;">
          CareerForge Team © 2026
        </p>
      </div>
    </div>
  `;
};
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
     Verify Account </a> </div> </div>`;
};
// export const resetPasswordTemplate = (resetUrl) => {
//   return `
//     <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 40px; text-align: center;">
//       <div style="max-width: 450px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
//         <h2 style="color: #333;">Password Reset Request</h2>
        
//         <p style="color: #666; line-height: 1.6;">
//           We received a request to reset your password. <br>
//           If you didn't make this request, you can safely ignore this email.
//         </p>

//         <div style="margin: 30px 0;">
//           <a href="${resetUrl}" style="
//             display: inline-block;
//             padding: 14px 25px;
//             background: #007bff;
//             color: white;
//             text-decoration: none;
//             border-radius: 8px;
//             font-weight: bold;
//             font-size: 16px;
//           ">
//             Reset Password
//           </a>
//         </div>

//         <p style="color: #999; font-size: 12px;">
//           This link will expire in 15 minutes.
//         </p>
        
//         <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        
//         <p style="color: #bbb; font-size: 11px;">
//           CareerForge Team © 2026
//         </p>
//       </div>
//     </div>
//   `;
// };

export const resetPasswordOtpTemplate = (otp) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; min-height: 600px;">
      <div style="max-width: 500px; margin: auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        
        <!-- Logo/Header -->
        <div style="margin-bottom: 30px;">
          <div style="width: 50px; height: 50px; margin: 0 auto 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold;">
            ✦
          </div>
          <h1 style="color: #333; margin: 0; font-size: 24px;">CareerForge</h1>
          <p style="color: #999; margin: 5px 0 0 0; font-size: 14px;">AI Career Assistant</p>
        </div>

        <!-- Title -->
        <h2 style="color: #333; font-size: 28px; margin: 30px 0 15px 0;">Password Reset Code</h2>
        
        <!-- Description -->
        <p style="color: #666; line-height: 1.8; font-size: 15px; margin: 0 0 30px 0;">
          You requested to reset your password. <br>
          <strong style="color: #333;">Use the code below to complete your password reset:</strong>
        </p>

        <!-- OTP Code - MAIN FOCUS -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 30px 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
          <p style="color: #fff; font-size: 13px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 2px;">Your Code</p>
         <h1 style="color:red">
  ${otp}
</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 15px 0 0 0;">
            ⏱️ Valid for <strong>15 minutes</strong>
          </p>
        </div>

        <!-- Instructions -->
        <div style="background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 6px; text-align: left; margin: 25px 0;">
          <p style="color: #333; margin: 0; font-size: 14px;">
            <strong>📝 How to use:</strong><br>
            1️⃣ Copy the code above<br>
            2️⃣ Go back to CareerForge app<br>
            3️⃣ Paste the code in the OTP field<br>
            4️⃣ Create your new password
          </p>
        </div>

        <!-- Security Notice -->
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin: 20px 0; text-align: center;">
          <p style="color: #856404; margin: 0; font-size: 13px;">
            ⚠️ <strong>Never share this code with anyone!</strong><br>
            CareerForge will never ask for this code via email or messages.
          </p>
        </div>

        <!-- Divider -->
        <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">

        <!-- Footer Help -->
        <p style="color: #999; font-size: 13px; margin: 0;">
          Didn't request this? <strong>Your account is safe.</strong> Just ignore this email.
        </p>
        <p style="color: #bbb; font-size: 12px; margin: 15px 0 0 0;">
          CareerForge Team © 2026 | All Rights Reserved
        </p>
      </div>

      <!-- Bottom spacer -->
      <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 30px;">
        If you have any issues, contact us at support@careerforge.com
      </p>
    </div>
  `;
};

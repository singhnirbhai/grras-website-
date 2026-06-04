export const studentWelcomeTemplate = (studentData: {
  email: string;
  password?: string;
  userId: string;
  name: string;
}) => {
  const { email, password, userId, name } = studentData;
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Grras Solutions</title>
      <style>
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f3f4f6; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; padding: 10px !important; }
          .header { padding: 32px 20px !important; }
          .content { padding: 30px 20px !important; }
          .credential-label, .credential-value { display: block !important; width: 100% !important; text-align: left !important; }
          .credential-value { margin-top: 5px !important; }
          .cta-button { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
        }
      </style>
    </head>
    <body style="background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f3f4f6" style="background-color: #f3f4f6; table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
              
              <!-- Colored Banner Header -->
              <tr>
                <td align="center" bgcolor="#16a34a" class="header" style="background: linear-gradient(135deg, #15803d 0%, #16a34a 100%); padding: 48px 40px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">Welcome Aboard!</h1>
                  <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9; line-height: 1.4;">Your academic journey begins here</p>
                </td>
              </tr>
              
              <!-- White Content Card Body -->
              <tr>
                <td class="content" style="padding: 40px; background-color: #ffffff;">
                  <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 16px;">Hello ${name},</div>
                  <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                    🎉 Congratulations! Your student account has been successfully created at <strong>Grras Solutions</strong>. We're excited to help you learn, build, and achieve your educational goals.
                  </p>
                  
                  <!-- Credentials Box (Table-based layout for high mail client compatibility) -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin: 24px 0;">
                    <tr>
                      <td style="padding: 24px;">
                        <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 16px; text-align: center;">Your Account Credentials</div>
                        
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
                          <!-- Student ID -->
                          <tr>
                            <td class="credential-label" width="40%" style="padding: 10px 0; color: #15803d; font-weight: 600; border-bottom: 1px dashed #bbf7d0;">Student ID</td>
                            <td class="credential-value" width="60%" style="padding: 10px 0; color: #111827; font-weight: 700; font-family: monospace; text-align: right; border-bottom: 1px dashed #bbf7d0;">${userId}</td>
                          </tr>
                          <!-- Email Address -->
                          <tr>
                            <td class="credential-label" width="40%" style="padding: 10px 0; color: #15803d; font-weight: 600; border-bottom: 1px dashed #bbf7d0;">Email Address</td>
                            <td class="credential-value" width="60%" style="padding: 10px 0; color: #111827; font-weight: 700; font-family: monospace; text-align: right; border-bottom: 1px dashed #bbf7d0; word-break: break-all;">${email}</td>
                          </tr>
                          <!-- Password -->
                          <tr>
                            <td class="credential-label" width="40%" style="padding: 10px 0; color: #15803d; font-weight: 600;">Temporary Password</td>
                            <td class="credential-value" width="60%" style="padding: 10px 0; color: #111827; font-weight: 700; font-family: monospace; text-align: right;">${password || "Secret"}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Centered CTA button -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding-top: 16px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:400'}" class="cta-button" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.2); text-align: center;">Access Student Portal</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 24px 0 0 0; font-size: 13px; color: #6b7280; text-align: center; line-height: 1.5;">
                    Please remember to change your temporary password upon logging in.
                  </p>
                </td>
              </tr>

              <!-- Help Banner -->
              <tr>
                <td style="padding: 0 40px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 600; color: #92400e;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        Need more help? <a href="mailto:support@grras.com" style="color: #b45309; text-decoration: underline;">We're here, ready to talk</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer Section -->
              <tr>
                <td class="content" style="padding: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6;">
                  <div style="font-size: 14px; font-weight: 800; color: #16a34a; margin-bottom: 12px;">Grras Solutions</div>
                  <p style="margin: 0 0 16px 0;">
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Dashboard</a> • 
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Results</a> • 
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Profile</a>
                  </p>
                  <p style="margin: 0;">© 2026 Grras Solutions. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const facultyWelcomeTemplate = (facultyData: {
  email: string;
  password?: string;
  name: string;
}) => {
  const { email, password, name } = facultyData;
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Grras Solutions - Faculty</title>
      <style>
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f3f4f6; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; padding: 10px !important; }
          .header { padding: 32px 20px !important; }
          .content { padding: 30px 20px !important; }
          .credential-label, .credential-value { display: block !important; width: 100% !important; text-align: left !important; }
          .credential-value { margin-top: 5px !important; }
          .cta-button { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
        }
      </style>
    </head>
    <body style="background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f3f4f6" style="background-color: #f3f4f6; table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
              
              <!-- Colored Banner Header -->
              <tr>
                <td align="center" bgcolor="#16a34a" class="header" style="background: linear-gradient(135deg, #15803d 0%, #16a34a 100%); padding: 48px 40px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">Welcome to Our Faculty!</h1>
                  <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9; line-height: 1.4;">Your teaching journey begins here</p>
                </td>
              </tr>
              
              <!-- White Content Card Body -->
              <tr>
                <td class="content" style="padding: 40px; background-color: #ffffff;">
                  <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 16px;">Hello Dr./Mr./Ms. ${name},</div>
                  <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                    🎉 Congratulations! Your faculty account has been successfully created at <strong>Grras Solutions</strong>. We're thrilled to have you join our distinguished academic instructional team!
                  </p>
                  
                  <!-- Credentials Box -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin: 24px 0;">
                    <tr>
                      <td style="padding: 24px;">
                        <div style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 16px; text-align: center;">Your Faculty Credentials</div>
                        
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
                          <!-- Email Address -->
                          <tr>
                            <td class="credential-label" width="40%" style="padding: 10px 0; color: #15803d; font-weight: 600; border-bottom: 1px dashed #bbf7d0;">Email Address</td>
                            <td class="credential-value" width="60%" style="padding: 10px 0; color: #111827; font-weight: 700; font-family: monospace; text-align: right; border-bottom: 1px dashed #bbf7d0; word-break: break-all;">${email}</td>
                          </tr>
                          <!-- Password -->
                          <tr>
                            <td class="credential-label" width="40%" style="padding: 10px 0; color: #15803d; font-weight: 600;">Temporary Password</td>
                            <td class="credential-value" width="60%" style="padding: 10px 0; color: #111827; font-weight: 700; font-family: monospace; text-align: right;">${password || "Secret"}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Centered CTA button -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding-top: 16px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:400'}" class="cta-button" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.2); text-align: center;">Access Faculty Portal</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Help Banner -->
              <tr>
                <td style="padding: 0 40px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 600; color: #92400e;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        Need portal assistance? <a href="mailto:support@grras.com" style="color: #b45309; text-decoration: underline;">We're here, ready to talk</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer Section -->
              <tr>
                <td class="content" style="padding: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6;">
                  <div style="font-size: 14px; font-weight: 800; color: #16a34a; margin-bottom: 12px;">Grras Solutions</div>
                  <p style="margin: 0 0 16px 0;">
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Dashboard</a> • 
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Quizzes</a> • 
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Results</a>
                  </p>
                  <p style="margin: 0;">© 2026 Grras Solutions. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const resultTemplate = (
  fileName: string,
  userName: string,
  score: string,
  correctCount: number,
  totalQuestions: number,
  results: Array<{
    question: string | null;
    selectedAnswer: string;
    correctAnswer: string | null;
    isCorrect: boolean;
  }>
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quiz Performance Results</title>
      <style>
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f3f4f6; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; padding: 10px !important; }
          .header { padding: 32px 20px !important; }
          .content { padding: 30px 15px !important; }
          .responsive-table th, .responsive-table td { padding: 10px 8px !important; font-size: 12px !important; }
          .score-display { font-size: 40px !important; }
          .cta-button { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
        }
      </style>
    </head>
    <body style="background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f3f4f6" style="background-color: #f3f4f6; table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
              
              <!-- Colored Banner Header -->
              <tr>
                <td align="center" bgcolor="#16a34a" class="header" style="background: linear-gradient(135deg, #15803d 0%, #16a34a 100%); padding: 48px 40px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">Quiz Results</h1>
                  <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9; line-height: 1.4;">Assessment scorecard for ${fileName}</p>
                </td>
              </tr>
              
              <!-- White Content Card Body -->
              <tr>
                <td class="content" style="padding: 40px; background-color: #ffffff;">
                  <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 16px;">Hi ${userName},</div>
                  <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                    Your quiz has been evaluated successfully! Below is your performance details and breakdown.
                  </p>
                  
                  <!-- Score Circle Display Box -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin-bottom: 32px; text-align: center;">
                    <tr>
                      <td style="padding: 24px;">
                        <div class="score-display" style="font-size: 48px; font-weight: 800; color: #16a34a; line-height: 1; margin-bottom: 8px;">${score}%</div>
                        <div style="font-size: 14px; font-weight: 700; color: #15803d;">
                          ${correctCount} Correct / ${totalQuestions - correctCount} Incorrect / ${totalQuestions} Total Questions
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Performance Summary Table -->
                  <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 16px 0;">Performance Summary</h3>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="responsive-table" style="font-size: 13px;">
                    <thead>
                      <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                        <th align="left" style="padding: 12px 16px; font-weight: 700; color: #374151;">Question</th>
                        <th align="left" style="padding: 12px 16px; font-weight: 700; color: #374151;">Your Ans</th>
                        <th align="left" style="padding: 12px 16px; font-weight: 700; color: #374151;">Correct Ans</th>
                        <th align="center" style="padding: 12px 16px; font-weight: 700; color: #374151; text-align: center;">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${results
                        .map(
                          (res) => `
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                          <td style="padding: 14px 16px; font-weight: 600; color: #1f2937;">${res.question || "N/A"}</td>
                          <td style="padding: 14px 16px; color: #4b5563;">${res.selectedAnswer || "Not Answered"}</td>
                          <td style="padding: 14px 16px; color: #10b981; font-weight: 600;">${res.correctAnswer || "N/A"}</td>
                          <td align="center" style="padding: 14px 16px; text-align: center;">
                            <span style="display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; ${
                              res.isCorrect 
                                ? 'background-color: #d1fae5; color: #065f46;' 
                                : 'background-color: #fee2e2; color: #991b1b;'
                            }">
                              ${res.isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          </td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>

                  <!-- Centered CTA button -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding-top: 32px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:400'}" class="cta-button" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.2); text-align: center;">Access Portal Dashboard</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Help Banner -->
              <tr>
                <td style="padding: 0 40px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 600; color: #92400e;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        Have questions about your score? <a href="mailto:support@grras.com" style="color: #b45309; text-decoration: underline;">Contact your instructor</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer Section -->
              <tr>
                <td class="content" style="padding: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6;">
                  <div style="font-size: 14px; font-weight: 800; color: #16a34a; margin-bottom: 12px;">Grras Solutions</div>
                  <p style="margin: 0 0 16px 0;">
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Dashboard</a> • 
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Results</a> • 
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Leaderboard</a>
                  </p>
                  <p style="margin: 0;">© 2026 Grras Solutions. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const resetPasswordTemplate = (resetLink: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f3f4f6; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; padding: 10px !important; }
          .header { padding: 32px 20px !important; }
          .content { padding: 30px 20px !important; }
          .cta-button { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
        }
      </style>
    </head>
    <body style="background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f3f4f6" style="background-color: #f3f4f6; table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
              
              <!-- Colored Banner Header -->
              <tr>
                <td align="center" bgcolor="#16a34a" class="header" style="background: linear-gradient(135deg, #15803d 0%, #16a34a 100%); padding: 48px 40px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">Reset Password</h1>
                  <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9; line-height: 1.4;">Unified Portal Password Assistance</p>
                </td>
              </tr>
              
              <!-- White Content Card Body -->
              <tr>
                <td class="content" style="padding: 40px; background-color: #ffffff;">
                  <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 16px;">Hi there,</div>
                  <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                    We received a request to reset your password. Click the button below to set a new password. This link is valid for 15 minutes:
                  </p>
                  
                  <!-- Centered CTA button -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding-top: 16px; padding-bottom: 24px;">
                        <a href="${resetLink}" class="cta-button" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.2); text-align: center;">Reset Password</a>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size: 13px; line-height: 1.6; color: #6b7280; margin: 0 0 16px 0;">
                    If the button above does not work, copy and paste the following URL into your browser:
                    <br/>
                    <a href="${resetLink}" style="color: #16a34a; word-break: break-all; text-decoration: underline;">${resetLink}</a>
                  </p>
                  
                  <p style="font-size: 13px; line-height: 1.5; color: #9ca3af; margin: 0;">
                    If you didn’t request a password reset, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer Section -->
              <tr>
                <td class="content" style="padding: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6;">
                  <div style="font-size: 14px; font-weight: 800; color: #16a34a; margin-bottom: 12px;">Grras Solutions</div>
                  <p style="margin: 0;">© 2026 Grras Solutions. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
